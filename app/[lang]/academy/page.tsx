"use client";

import React, { useState, useEffect, useRef, useCallback, Fragment } from "react";
import AcademyCategoriesNexus from "@/components/acadamy/AcademyCategoriesNexus";
import {
  Search,
  ChevronRight,
  PlayCircle,
  Brain,
  Award,
  BookOpen,
  Cpu,
  ArrowRight,
  GraduationCap,
  X,
  FileText,
  Lightbulb,
  PenLine,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { useGetPlansQuery, Plan } from "@/lib/redux/features/pricing/pricingApi";
import { useCreatePaymentIntentMutation } from "@/lib/redux/features/payments/paymentApi";
import { selectCurrentUser, selectCurrentToken } from "@/lib/redux/features/auth/authSlice";
import { toast } from "sonner";
import { userHasFeature, userOwnsPlanId } from "@/lib/access/effectiveAccess";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n/client";

const ease = [0.22, 1, 0.36, 1] as const;

const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const AcademyPage = () => {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isBarFocused, setIsBarFocused] = useState(false);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang]);

  useEffect(() => {
    const storedEndTime = localStorage.getItem("offerEndTime");
    const TOTAL_MS = 24 * 60 * 60 * 1000;
    let endTime = storedEndTime ? Number(storedEndTime) : Date.now() + TOTAL_MS;

    if (isNaN(endTime) || endTime <= Date.now()) {
      endTime = Date.now() + TOTAL_MS;
      localStorage.setItem("offerEndTime", endTime.toString());
    }

    const updateTimer = () => {
      const now = Date.now();
      let distance = endTime - now;
      if (distance <= 0) {
        endTime = Date.now() + TOTAL_MS;
        localStorage.setItem("offerEndTime", endTime.toString());
        distance = TOTAL_MS;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(inputValue.trim()), 350);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleKeydown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      inputRef.current?.focus();
    }
    if (e.key === "Escape") inputRef.current?.blur();
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [handleKeydown]);

  const { data: response } = useGetPlansQuery();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  const getUserId = () => {
    if (user?.id) return user.id;
    let currentToken = token;
    if (!currentToken && typeof document !== "undefined") {
      const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
      if (match) currentToken = match[2];
    }
    if (currentToken) {
      const decoded = decodeJwt(currentToken);
      return decoded?.id || decoded?.userId || decoded?._id || null;
    }
    return null;
  };

  const currentUserId = getUserId();
  const plans = response?.data || [];
  const plan =
    plans.find((p) => p.name?.toLowerCase().includes("pro")) ||
    plans.find((p) => p.name?.toLowerCase().includes("plus")) ||
    plans[1];
  const isPurchased =
    userOwnsPlanId(user, plan?.id || plan?._id) || userHasFeature(user, "COURSES");

  const handlePlanSelect = async (selectedPlan: Plan) => {
    if (isPurchased) {
      toast.success(t("academy.alreadyPurchased", "You already have access to this plan."));
      return;
    }
    if (!currentUserId) {
      router.push(`/${lang}/auth/login`);
      return;
    }
    const isFree =
      selectedPlan.discountedPrice === 0 ||
      selectedPlan.name?.toLowerCase().includes("free");
    if (isFree) {
      router.push(`/${lang}/academy`);
      return;
    }
    const isAdmin =
      user?.role === "admin" || (token ? decodeJwt(token)?.role === "admin" : false);

    if (isAdmin) {
      toast.warning(
        t(
          "pricingPage.adminWarning",
          "Admin Account: Real payments are disabled for admin roles. Redirecting to Sandbox checkout..."
        ),
        {
          description: t(
            "pricingPage.adminWarningDesc",
            "Admins are not allowed to make live transactions. Test credentials have been prefilled for your convenience."
          ),
          duration: 5000,
        }
      );
      setTimeout(() => {
        const mockQueryParams = new URLSearchParams({
          clientSecret: "pi_mock_123_secret_mock_456",
          planName: selectedPlan.name,
          price: selectedPlan.discountedPrice.toString(),
          originalPrice: selectedPlan.originalPrice.toString(),
          isMock: "true",
          isAdminPayment: "true",
        }).toString();
        router.push(`/${lang}/payment?${mockQueryParams}`);
      }, 1500);
      return;
    }

    try {
      setProcessingPlanId(selectedPlan._id || selectedPlan.id);
      const courseId = searchParams.get("courseId") || undefined;
      const result = await createPaymentIntent({
        planId: selectedPlan.id,
        userId: currentUserId,
        courseId: courseId,
      }).unwrap();

      if (result.success) {
        const hostedUrl =
          (result.data as { checkoutUrl?: string; sessionUrl?: string; url?: string })
            ?.checkoutUrl ||
          (result.data as { checkoutUrl?: string; sessionUrl?: string; url?: string })
            ?.sessionUrl ||
          (result.data as { checkoutUrl?: string; sessionUrl?: string; url?: string })?.url;
        if (
          hostedUrl &&
          typeof hostedUrl === "string" &&
          (hostedUrl.startsWith("http://") || hostedUrl.startsWith("https://"))
        ) {
          window.location.href = hostedUrl;
          return;
        }

        if (result.data?.clientSecret) {
          const queryParams = new URLSearchParams({
            clientSecret: result.data.clientSecret,
            planId: selectedPlan.id || selectedPlan._id || "",
            planName: selectedPlan.name,
            price: selectedPlan.discountedPrice.toString(),
            originalPrice: selectedPlan.originalPrice.toString(),
            courseId: courseId ?? "",
          }).toString();
          router.push(`/${lang}/payment?${queryParams}`);
          return;
        }
      }
    } catch (error) {
      const err = error as {
        data?: { err?: { type?: string } };
        status?: number;
        message?: string;
      };
      console.error("Failed to create payment intent:", error);

      if (err?.status === 500) {
        toast.error(
          t(
            "pricingPage.serverError",
            "Internal Server Error: Could not initiate payment. Please try again later."
          )
        );
        return;
      }

      const isStripeError =
        err?.data?.err?.type?.includes("Stripe") ||
        JSON.stringify(err).includes("Stripe") ||
        JSON.stringify(error).includes("customer");

      if (isStripeError) {
        const confirmMock = window.confirm(
          t(
            "pricingPage.stripeError",
            "Stripe payment initiation failed. Do you want to proceed with a mock checkout?"
          )
        );
        if (confirmMock) {
          const mockQueryParams = new URLSearchParams({
            clientSecret: "pi_mock_123_secret_mock_456",
            planName: selectedPlan.name,
            price: selectedPlan.discountedPrice.toString(),
            originalPrice: selectedPlan.originalPrice.toString(),
            isMock: "true",
          }).toString();
          router.push(`/${lang}/payment?${mockQueryParams}`);
        }
      } else {
        toast.error(
          t("pricingPage.paymentError", "Failed to initiate payment. Please try again.")
        );
      }
    } finally {
      setProcessingPlanId(null);
    }
  };

  void processingPlanId;
  void handlePlanSelect;

  const clearSearch = () => {
    setInputValue("");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-[var(--ib-bg)] font-inter text-[var(--ib-ink)] selection:bg-[var(--ib-acc)] selection:text-white">
      {/* ── Academy Hero ─────────────────────────────────── */}
      <header className="relative overflow-x-clip px-4 pb-10 pt-14 sm:px-6 sm:pb-14 sm:pt-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute left-1/2 top-[-12%] h-[520px] w-[min(920px,100%)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--ib-acc)_14%,transparent),transparent_70%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--ib-line)] to-transparent" />
        </div>

        <div className="ib-w relative z-[1] max-w-7xl!">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="mx-auto max-w-[720px] text-center"
          >
            <div className="ib-eye mx-auto inline-flex items-center gap-2">
              <GraduationCap className="size-3.5" aria-hidden />
              {t("academy.learningExperience")}
            </div>

            <h1 className="mb-0! mt-3 text-[32px] font-bold leading-[1.12] tracking-[-0.035em] text-[var(--ib-ink)] sm:text-[40px] lg:text-[48px]">
              {t("academy.heroHeading")}
            </h1>

            <p className="mx-auto mt-4 max-w-[560px] text-[15px] leading-relaxed text-[var(--ib-mute)] sm:text-[16.5px]">
              {t("academy.description")}
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.08, ease }}
            className="mx-auto mt-8 w-full max-w-[640px]"
          >
            <label htmlFor="academy-search" className="sr-only">
              {t("academy.searchPlaceholder")}
            </label>
            <div
              className={`flex h-12 items-center gap-3 rounded-[14px] border bg-[var(--ib-card)] px-4 shadow-[0_12px_40px_-28px_rgba(11,18,32,0.35)] transition-all duration-300 sm:h-14 sm:px-5 ${
                isBarFocused
                  ? "border-[var(--ib-acc)] ring-2 ring-[color-mix(in_srgb,var(--ib-acc)_18%,transparent)]"
                  : "border-[var(--ib-line)] hover:border-[color-mix(in_srgb,var(--ib-acc)_28%,var(--ib-line))]"
              }`}
            >
              <Search
                className={`size-[18px] shrink-0 transition-colors ${
                  isBarFocused ? "text-[var(--ib-acc)]" : "text-[var(--ib-mute)]"
                }`}
                aria-hidden
              />
              <input
                id="academy-search"
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setIsBarFocused(true)}
                onBlur={() => setIsBarFocused(false)}
                placeholder={t("academy.searchPlaceholder")}
                className="min-w-0 flex-1 border-none bg-transparent text-[15px] text-[var(--ib-ink)] outline-none placeholder:text-[var(--ib-mute)]"
                autoComplete="off"
              />
              {inputValue ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-[var(--ib-mute)] transition-colors hover:bg-[var(--ib-accbg)] hover:text-[var(--ib-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
                  aria-label={t("academy.all")}
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
          </motion.div>
        </div>
      </header>

      {/* ── Pro upsell (non-purchased) ───────────────────── */}
      {!isPurchased && (
        <section className="relative overflow-x-clip border-y border-[var(--ib-line)] bg-[color-mix(in_srgb,var(--ib-card)_70%,var(--ib-accbg))] px-4 py-12 sm:px-6 sm:py-16">
          <div className="ib-w max-w-7xl!">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <div className="ib-eye mb-3 inline-flex items-center gap-2">
                <BookOpen className="size-3.5" aria-hidden />
                {t("academy.countdownText")}
              </div>

              <h2 className="mb-0! text-[24px] font-bold tracking-[-0.03em] text-[var(--ib-ink)] sm:text-[30px]">
                {t("academy.isobrainProTitle")}{" "}
                <span className="text-[var(--ib-acc)]">{t("academy.isobrainProPrice")}</span>
              </h2>

              <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-[var(--ib-mute)] sm:text-[15.5px]">
                {t("academy.popularTierDesc")}
              </p>
              <p className="mt-2 max-w-lg text-[13px] italic leading-relaxed text-[var(--ib-mute)] sm:text-[14px]">
                {t("academy.designedForPros")}
              </p>

              <p className="mt-5 text-[16px] font-semibold text-[var(--ib-ink)] sm:text-[18px]">
                {t("academy.masterSkills")}
              </p>

              <button
                type="button"
                onClick={() => router.push(`/${lang}/pricing`)}
                className="group mt-5 inline-flex items-center justify-center gap-2.5 rounded-[12px] bg-[var(--ib-acc)] px-7 py-3.5 text-[13px] font-bold uppercase tracking-wider text-white shadow-[0_14px_32px_-14px_rgba(27,77,219,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)] sm:text-[14px]"
              >
                <span>{t("academy.getStartedBtn")}</span>
                <ArrowRight
                  className="size-5 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </button>

              <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)] px-5 py-4 shadow-sm sm:gap-4 sm:px-8 sm:py-5">
                {[
                  { key: "hours", label: t("academy.hours"), value: timeLeft.hours },
                  { key: "mins", label: t("academy.mins"), value: timeLeft.minutes },
                  {
                    key: "secs",
                    label: t("academy.secs"),
                    value: timeLeft.seconds,
                    isAccent: true,
                  },
                ].map((time, index) => (
                  <Fragment key={time.key}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex size-12 items-center justify-center rounded-xl text-lg font-bold sm:size-14 sm:text-xl ${
                          time.isAccent
                            ? "border border-[color-mix(in_srgb,var(--ib-acc)_35%,transparent)] bg-[var(--ib-accbg)] text-[var(--ib-acc)]"
                            : "border border-[var(--ib-line)] bg-[var(--ib-bg)] text-[var(--ib-ink)]"
                        }`}
                      >
                        {time.value.toString().padStart(2, "0")}
                      </div>
                      <span
                        className={`mt-1.5 text-[9px] font-semibold uppercase tracking-widest sm:text-[10px] ${
                          time.isAccent ? "text-[var(--ib-acc)]" : "text-[var(--ib-mute)]"
                        }`}
                      >
                        {time.label}
                      </span>
                    </div>
                    {index < 2 && (
                      <span className="mb-5 text-xl font-bold text-[var(--ib-mute)] sm:text-2xl">
                        :
                      </span>
                    )}
                  </Fragment>
                ))}
              </div>
            </div>

            <div className="mx-auto mt-14 max-w-5xl border-t border-[var(--ib-line)] pt-12 text-center">
              <h3 className="mb-0! text-[18px] font-semibold uppercase tracking-wider text-[var(--ib-ink)] sm:text-[20px]">
                {t("academy.forUSDYouGet")}
              </h3>
              <p className="mx-auto mt-2 max-w-2xl text-[14px] text-[var(--ib-mute)] sm:text-[15px]">
                {t("academy.everythingInPlus")}
              </p>
              <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-10 md:gap-y-10">
                {[
                  {
                    title: t("academy.unlimitedAccessTitle"),
                    desc: t("academy.unlimitedAccessDesc"),
                  },
                  {
                    title: t("academy.highQualityTitle"),
                    desc: t("academy.highQualityDesc"),
                  },
                  {
                    title: t("academy.advancedStudyTitle"),
                    desc: t("academy.advancedStudyDesc"),
                  },
                  {
                    title: t("academy.unlimitedCPDTitle"),
                    desc: t("academy.unlimitedCPDDesc"),
                  },
                ].map((b) => (
                  <div key={b.title} className="space-y-2">
                    <h4 className="mb-0! text-[14px] font-bold uppercase tracking-wide text-[var(--ib-acc)] sm:text-[15px]">
                      {b.title}
                    </h4>
                    <p className="mx-auto max-w-md text-[14px] leading-relaxed text-[var(--ib-mute)] sm:text-[15px]">
                      {b.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Purchased learning system ────────────────────── */}
      {isPurchased && (
        <>
          <section className="border-t border-[var(--ib-line)] px-4 py-14 sm:px-6 sm:py-20">
            <div className="ib-w max-w-7xl!">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, ease }}
                className="mx-auto mb-10 max-w-[680px] text-center md:mb-12"
              >
                <h2 className="mb-0! text-[28px] font-bold leading-[1.2] tracking-[-0.03em] text-[var(--ib-ink)] sm:text-[34px]">
                  {t("academy.systemBuiltTitle")}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--ib-mute)] sm:text-[17px]">
                  {t("academy.systemBuiltDesc")}
                </p>
              </motion.div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
                {[
                  {
                    title: t("academy.expertLedTitle"),
                    desc: t("academy.expertLedDesc"),
                    icon: PlayCircle,
                  },
                  {
                    title: t("academy.aiSupportedTitle"),
                    desc: t("academy.aiSupportedDesc"),
                    icon: Brain,
                  },
                  {
                    title: t("academy.certPathTitle"),
                    desc: t("academy.certPathDesc"),
                    icon: Award,
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={item.title}
                    initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      duration: 0.4,
                      delay: reduceMotion ? 0 : idx * 0.06,
                      ease,
                    }}
                    className="ib-card flex flex-col p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ib-acc)_30%,var(--ib-line))]"
                  >
                    <item.icon className="mb-5 size-8 text-[var(--ib-acc)]" aria-hidden />
                    <h3 className="mb-0! text-xl font-bold text-[var(--ib-ink)]">{item.title}</h3>
                    <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--ib-mute)]">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="border-t border-[var(--ib-line)] px-4 py-14 sm:px-6 sm:py-20">
            <div className="ib-w max-w-7xl!">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, ease }}
                className="mx-auto mb-10 max-w-[680px] text-center md:mb-12"
              >
                <h2 className="mb-0! text-[28px] font-bold leading-[1.2] tracking-[-0.03em] text-[var(--ib-ink)] sm:text-[34px]">
                  {t("academy.aiPoweredTitle")}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--ib-mute)] sm:text-[17px]">
                  {t("academy.aiPoweredDesc")}
                </p>
              </motion.div>
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                {[
                  {
                    title: t("academy.studyGuideTitle"),
                    desc: t("academy.studyGuideDesc"),
                    icon: FileText,
                  },
                  {
                    title: t("academy.briefingDocsTitle"),
                    desc: t("academy.briefingDocsDesc"),
                    icon: BookOpen,
                  },
                  {
                    title: t("academy.analogiesTitle"),
                    desc: t("academy.analogiesDesc"),
                    icon: Lightbulb,
                  },
                  {
                    title: t("academy.smartNotesTitle"),
                    desc: t("academy.smartNotesDesc"),
                    icon: PenLine,
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={item.title}
                    initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      duration: 0.4,
                      delay: reduceMotion ? 0 : idx * 0.05,
                      ease,
                    }}
                    className="ib-card flex items-start gap-5 p-6 transition-shadow duration-300 hover:shadow-[0_14px_32px_-24px_rgba(27,77,219,0.3)] sm:p-7"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
                      <item.icon className="size-6" aria-hidden />
                    </div>
                    <div>
                      <h3 className="mb-0! text-lg font-bold text-[var(--ib-ink)]">{item.title}</h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-[var(--ib-mute)]">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── Category / course explorer ───────────────────── */}
      <AcademyCategoriesNexus searchTerm={searchQuery} />

      {/* ── Career outcomes CTA ──────────────────────────── */}
      <section className="border-t border-[var(--ib-line)] px-4 pb-20 pt-6 sm:px-6 sm:pb-28 sm:pt-10">
        <div className="ib-w max-w-6xl!">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, ease }}
            className="ib-card relative overflow-hidden px-6 py-12 text-center sm:px-12 sm:py-16 md:rounded-[32px] md:px-16 md:py-20"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[var(--ib-accbg)] blur-[100px]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-[var(--ib-accbg)] blur-[100px]"
            />

            <div className="relative z-[1]">
              <h2 className="mb-0! text-[26px] font-semibold leading-[1.25] text-[var(--ib-ink)] sm:text-[34px]">
                {t("academy.careerTransformTitle")}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--ib-mute)] sm:text-[17px]">
                {t("academy.careerTransformDesc")}
              </p>

              <div className="mt-10 mb-12 grid grid-cols-1 gap-8 text-left md:grid-cols-3 md:gap-8">
                {[
                  {
                    title: t("academy.resumeBoostingTitle"),
                    desc: t("academy.resumeBoostingDesc"),
                    icon: Award,
                  },
                  {
                    title: t("academy.focusedTitle"),
                    desc: t("academy.focusedDesc"),
                    icon: BookOpen,
                  },
                  {
                    title: t("academy.quizzesTitle"),
                    desc: t("academy.quizzesDesc"),
                    icon: Cpu,
                  },
                ].map((item) => (
                  <div key={item.title} className="space-y-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-[var(--ib-accbg)]">
                      <item.icon className="size-6 text-[var(--ib-acc)]" aria-hidden />
                    </div>
                    <h3 className="mb-0! text-[17px] font-bold text-[var(--ib-ink)]">
                      {item.title}
                    </h3>
                    <p className="text-[14px] leading-relaxed text-[var(--ib-mute)]">{item.desc}</p>
                  </div>
                ))}
              </div>

              <Link
                href={`/${lang}/mastery-lab`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--ib-acc)] px-8 py-4 text-[13px] font-bold uppercase tracking-wide text-white shadow-[0_14px_32px_-14px_rgba(27,77,219,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)] sm:px-8 sm:py-5 sm:text-[14px]"
              >
                {t("academy.beginPath")}
                <ChevronRight className="size-5" aria-hidden />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AcademyPage;
