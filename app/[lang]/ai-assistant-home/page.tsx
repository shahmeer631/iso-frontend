"use client";

import ReviewSection from "@/components/AIAssistant/ReviewSection";
import Footer from "@/sheard/Footer";
import Navbar from "@/sheard/Navbar";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  ShieldCheck,
  BarChart3,
  Globe,
  GraduationCap,
  Sparkles,
  Search,
  Send,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import {
  useState,
  useEffect,
  useRef,
  Fragment,
  FormEvent,
  type ComponentType,
} from "react";
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

const PromptPills = ({
  onClick,
  reduceMotion,
}: {
  onClick: (p: string) => void;
  reduceMotion: boolean | null;
}) => {
  const { t } = useTranslation();

  const prompts = [
    { label: t("aiAssistantHome.promptQuality"), value: "Quality (9001) Courses" },
    { label: t("aiAssistantHome.promptSecurity"), value: "Security (27001) Courses" },
    {
      label: t("aiAssistantHome.promptEnvironmental"),
      value: "Environmental (14001) Courses",
    },
    { label: t("aiAssistantHome.promptHealth"), value: "Health & Safety Courses" },
    {
      label: t("aiAssistantHome.promptInfoSec"),
      value: "Information Security Policy",
    },
  ];

  return (
    <div className="mt-6 flex flex-wrap justify-center gap-2.5 sm:gap-3">
      {prompts.map((prompt, i) => (
        <motion.button
          key={prompt.value}
          type="button"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            delay: reduceMotion ? 0 : 0.12 + i * 0.05,
            ease,
          }}
          onClick={() => onClick(prompt.value)}
          className="rounded-full border border-[var(--ib-line)] bg-[var(--ib-card)] px-3.5 py-2 text-[12.5px] font-medium text-[var(--ib-mute)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ib-acc)_35%,var(--ib-line))] hover:bg-[var(--ib-accbg)] hover:text-[var(--ib-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)] sm:text-[13.5px]"
        >
          {prompt.label}
        </motion.button>
      ))}
    </div>
  );
};

const ModuleCard = ({
  badge,
  code,
  title,
  description,
  href,
  cta,
  icon: Icon,
  reduceMotion,
  index,
}: {
  badge: string;
  code: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  reduceMotion: boolean | null;
  index: number;
}) => (
  <motion.article
    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{
      duration: 0.4,
      delay: reduceMotion ? 0 : Math.min(index * 0.06, 0.3),
      ease,
    }}
    className="ib-card group relative flex h-full flex-col overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--ib-acc)_35%,var(--ib-line))] hover:shadow-[0_18px_40px_-24px_rgba(27,77,219,0.35)] sm:p-8 md:p-10"
  >
    <div
      aria-hidden
      className="pointer-events-none absolute -right-4 -bottom-4 text-[var(--ib-acc)] opacity-[0.06] transition-opacity duration-300 group-hover:opacity-[0.12]"
    >
      <Icon className="size-36" aria-hidden />
    </div>

    <div className="relative z-[1] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="w-fit rounded-full border border-[color-mix(in_srgb,var(--ib-acc)_20%,var(--ib-line))] bg-[var(--ib-accbg)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--ib-acc)] sm:text-[11px]">
        {badge}
      </div>
      <div className="font-mono text-[10px] text-[var(--ib-mute)]">{code}</div>
    </div>

    <div className="relative z-[1] mt-5 flex size-11 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
      <Icon className="size-5" aria-hidden />
    </div>

    <h3 className="relative z-[1] mb-0! mt-4 text-[22px] font-bold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[24px]">
      {title}
    </h3>
    <p className="relative z-[1] mt-3 flex-1 text-[14px] leading-relaxed text-[var(--ib-mute)] sm:text-[15px]">
      {description}
    </p>
    <Link
      href={href}
      className="group/btn relative z-[1] mt-6 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-[var(--ib-acc)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
    >
      {cta}
      <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" aria-hidden />
    </Link>
  </motion.article>
);

const AIAssistantHome = () => {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const [searchQuery, setSearchQuery] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang]);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

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

  const router = useRouter();
  const searchParams = useSearchParams();

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
    plans.find(
      (p) =>
        p.name?.toLowerCase().includes("ultra") ||
        p.name?.toLowerCase().includes("enterprise")
    ) || plans[2];
  const isPurchased =
    userOwnsPlanId(user, plan?.id || plan?._id) ||
    userHasFeature(user, "AI_ASSISTANT");

  const handlePlanSelect = async (selectedPlan: Plan) => {
    if (isPurchased) {
      toast.success(
        t("aiAssistantHome.alreadyPurchased", "You already have access to this plan.")
      );
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

      if (result.success && result.data?.clientSecret) {
        const queryParams = new URLSearchParams({
          clientSecret: result.data.clientSecret,
          planId: selectedPlan.id || selectedPlan._id || "",
          planName: selectedPlan.name,
          price: selectedPlan.discountedPrice.toString(),
          originalPrice: selectedPlan.originalPrice.toString(),
          courseId: courseId ?? "",
        }).toString();
        router.push(`/${lang}/payment?${queryParams}`);
      } else if (result.success && (result.data as { url?: string })?.url) {
        window.location.href = (result.data as { url: string }).url;
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

  const runSearch = (customQuery?: string) => {
    const query = (customQuery || searchQuery).trim();
    if (!query) return;

    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("course") || lowerQuery.includes("academy")) {
      if (lowerQuery.includes("quality")) router.push(`/${lang}/academy?category=Quality`);
      else if (lowerQuery.includes("security"))
        router.push(`/${lang}/academy?category=Security`);
      else if (lowerQuery.includes("environmental"))
        router.push(`/${lang}/academy?category=Environmental`);
      else if (lowerQuery.includes("health")) router.push(`/${lang}/academy?category=Health`);
      else router.push(`/${lang}/academy`);
    } else if (lowerQuery.includes("audit") || lowerQuery.includes("lens")) {
      router.push(`/${lang}/ai-assistant/audit-lens`);
    } else if (lowerQuery.includes("navigator") || lowerQuery.includes("map")) {
      router.push(`/${lang}/ai-assistant/iso-navigator`);
    } else if (lowerQuery.includes("benchmark") || lowerQuery.includes("analysis")) {
      router.push(`/${lang}/ai-assistant/benchmark-ai`);
    } else if (lowerQuery.includes("price") || lowerQuery.includes("plan")) {
      router.push(`/${lang}/pricing`);
    } else {
      router.push(
        `/${lang}/library/iso-standards?search=${encodeURIComponent(query)}`
      );
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    runSearch();
  };

  const modules = [
    {
      badge: t("aiAssistantHome.protocolExecution"),
      code: t("aiAssistantHome.codeNav"),
      title: t("aiAssistantHome.isoNavigator"),
      description: t("aiAssistantHome.navigatorDesc"),
      href: `/${lang}/ai-assistant/iso-navigator`,
      cta: t("aiAssistantHome.initializeSync"),
      icon: Globe,
    },
    {
      badge: t("aiAssistantHome.forensicCore"),
      code: t("aiAssistantHome.codeAud"),
      title: t("aiAssistantHome.auditLens"),
      description: t("aiAssistantHome.auditDesc"),
      href: `/${lang}/ai-assistant/audit-lens`,
      cta: t("aiAssistantHome.auditBtn"),
      icon: ShieldCheck,
    },
    {
      badge: t("aiAssistantHome.evaluation"),
      code: t("aiAssistantHome.codeBen"),
      title: t("aiAssistantHome.benchmarkAi"),
      description: t("aiAssistantHome.benchmarkDesc"),
      href: `/${lang}/ai-assistant/benchmark-ai`,
      cta: t("aiAssistantHome.benchmarkBtn"),
      icon: BarChart3,
    },
    {
      badge: t("aiAssistantHome.knowledgeBase"),
      code: t("aiAssistantHome.codeLib"),
      title: t("aiAssistantHome.isoLibrary"),
      description: t("aiAssistantHome.libraryDesc"),
      href: `/${lang}/library/iso-standards`,
      cta: t("aiAssistantHome.libraryBtn"),
      icon: FileText,
    },
  ];

  return (
    <div className="min-h-screen overflow-x-clip bg-[var(--ib-bg)] font-inter text-[var(--ib-ink)] selection:bg-[var(--ib-accbg)] selection:text-[var(--ib-acc)]">
      <Navbar />

      {/* ── Assistant Welcome ────────────────────────────── */}
      <header className="relative overflow-x-clip px-4 pb-10 pt-14 sm:px-6 sm:pb-14 sm:pt-16">
        <div aria-hidden className="pointer-events-none absolute inset-0">
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
              <Sparkles className="size-3.5" aria-hidden />
              {t("nav.aiAssistant")}
            </div>

            <h1 className="mb-0! mt-3 text-[30px] font-bold leading-[1.12] tracking-[-0.035em] text-[var(--ib-ink)] sm:text-[40px] lg:text-[46px]">
              {t("nav.aiAssistantSub.home")}
            </h1>

            <p className="mx-auto mt-4 max-w-[580px] text-[15px] leading-relaxed text-[var(--ib-mute)] sm:text-[16.5px]">
              {t("platform.aiAssistant.description")}
            </p>
          </motion.div>

          {/* Prompt input */}
          <motion.form
            onSubmit={handleSearch}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.08, ease }}
            className="mx-auto mt-8 w-full max-w-[680px]"
          >
            <label htmlFor="ai-assistant-prompt" className="sr-only">
              {t(
                "aiAssistantHome.searchPlaceholder",
                "Ask about ISO standards, audits, or courses…"
              )}
            </label>
            <div
              className={`flex items-center gap-3 rounded-[16px] border bg-[var(--ib-card)] px-4 py-3 shadow-[0_14px_44px_-28px_rgba(11,18,32,0.4)] transition-all duration-300 sm:px-5 sm:py-3.5 ${
                isInputFocused
                  ? "border-[var(--ib-acc)] ring-2 ring-[color-mix(in_srgb,var(--ib-acc)_18%,transparent)] shadow-[0_16px_48px_-24px_rgba(27,77,219,0.35)]"
                  : "border-[var(--ib-line)] hover:border-[color-mix(in_srgb,var(--ib-acc)_28%,var(--ib-line))]"
              }`}
            >
              <Search
                className={`size-[18px] shrink-0 transition-colors ${
                  isInputFocused ? "text-[var(--ib-acc)]" : "text-[var(--ib-mute)]"
                }`}
                aria-hidden
              />
              <input
                id="ai-assistant-prompt"
                ref={inputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder={t(
                  "aiAssistantHome.searchPlaceholder",
                  "Ask about ISO standards, audits, or courses…"
                )}
                className="min-w-0 flex-1 border-none bg-transparent text-[15px] text-[var(--ib-ink)] outline-none placeholder:text-[var(--ib-mute)]"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={!searchQuery.trim()}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ib-acc)] text-white transition-all duration-200 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
                aria-label={t("platform.aiAssistant.btn")}
              >
                <Send className="size-4" aria-hidden />
              </button>
            </div>

            <PromptPills
              reduceMotion={reduceMotion}
              onClick={(value) => {
                setSearchQuery(value);
                runSearch(value);
              }}
            />
          </motion.form>
        </div>
      </header>

      {/* ── Ultra upsell (non-purchased) ──────────────────── */}
      {!isPurchased && (
        <section className="relative overflow-x-clip border-y border-[var(--ib-line)] bg-[color-mix(in_srgb,var(--ib-card)_70%,var(--ib-accbg))] px-4 py-12 sm:px-6 sm:py-16">
          <div className="ib-w max-w-7xl!">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <div className="ib-eye mb-3 inline-flex items-center gap-2">
                <BookOpen className="size-3.5" aria-hidden />
                {t("aiAssistantHome.claimDiscountBadge")}
              </div>

              <h2 className="mb-0! text-[24px] font-bold tracking-[-0.03em] text-[var(--ib-ink)] sm:text-[30px]">
                {t("aiAssistantHome.isobrainUltraTitle")}{" "}
                <span className="text-[var(--ib-acc)]">
                  {t("aiAssistantHome.isobrainUltraPrice")}
                </span>
              </h2>

              <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-[var(--ib-mute)] sm:text-[15.5px]">
                {t("aiAssistantHome.ultimateCompanionDesc")}
              </p>
              <p className="mt-2 max-w-lg text-[13px] italic leading-relaxed text-[var(--ib-mute)] sm:text-[14px]">
                {t("aiAssistantHome.builtForAuditTeamsDesc")}
              </p>

              <p className="mt-5 text-[16px] font-semibold text-[var(--ib-ink)] sm:text-[18px]">
                {t("aiAssistantHome.enhanceSkillsHeading")}
              </p>

              <button
                type="button"
                onClick={() => router.push(`/${lang}/pricing`)}
                className="group mt-5 inline-flex items-center justify-center gap-2.5 rounded-[12px] bg-[var(--ib-acc)] px-7 py-3.5 text-[12px] font-bold uppercase tracking-wider text-white shadow-[0_14px_32px_-14px_rgba(27,77,219,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)] sm:text-[13px]"
              >
                <span>{t("aiAssistantHome.getStartedBtn")}</span>
                <ArrowRight
                  className="size-5 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </button>

              <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)] px-5 py-4 shadow-sm sm:gap-4 sm:px-8 sm:py-5">
                {[
                  { key: "hours", label: t("aiAssistantHome.hours"), value: timeLeft.hours },
                  { key: "mins", label: t("aiAssistantHome.mins"), value: timeLeft.minutes },
                  {
                    key: "secs",
                    label: t("aiAssistantHome.secs"),
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
                {t("aiAssistantHome.forUSDYouGet")}
              </h3>
              <p className="mx-auto mt-2 max-w-2xl text-[14px] text-[var(--ib-mute)] sm:text-[15px]">
                {t("aiAssistantHome.everythingInPro")}
              </p>
              <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-10 md:gap-y-10">
                {[
                  {
                    title: t("aiAssistantHome.unlimitedAIAccessTitle"),
                    desc: t("aiAssistantHome.unlimitedAIAccessDesc"),
                  },
                  {
                    title: t("aiAssistantHome.isoNavigatorTitle"),
                    desc: t("aiAssistantHome.isoNavigatorBenefitDesc"),
                  },
                  {
                    title: t("aiAssistantHome.auditLensTitle"),
                    desc: t("aiAssistantHome.auditLensBenefitDesc"),
                  },
                  {
                    title: t("aiAssistantHome.benchmarkAITitle"),
                    desc: t("aiAssistantHome.benchmarkAIBenefitDesc"),
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

      {/* ── AI Modules ───────────────────────────────────── */}
      <section className="relative px-4 py-14 sm:px-6 sm:py-20">
        <div className="ib-w max-w-7xl!">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, ease }}
            className="mx-auto mb-10 max-w-[720px] text-center md:mb-14"
          >
            <h2 className="mb-0! text-[28px] font-bold leading-[1.2] tracking-[-0.03em] text-[var(--ib-ink)] sm:text-[34px]">
              {t("aiAssistantHome.neuralEcosystemTitle")}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--ib-mute)] sm:text-[17px]">
              {t("aiAssistantHome.neuralEcosystemDesc")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            {modules.map((mod, index) => (
              <ModuleCard key={mod.href} {...mod} index={index} reduceMotion={reduceMotion} />
            ))}
          </div>

          {/* Academy card */}
          <motion.article
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease }}
            className="ib-card group relative mt-5 overflow-hidden p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ib-acc)_35%,var(--ib-line))] hover:shadow-[0_18px_40px_-24px_rgba(27,77,219,0.35)] sm:mt-6 sm:p-8 md:mx-auto md:max-w-4xl md:p-10"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-4 -bottom-4 text-[var(--ib-acc)] opacity-[0.08] transition-opacity group-hover:opacity-[0.14]"
            >
              <GraduationCap className="size-40" aria-hidden />
            </div>
            <div className="relative z-[1] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-fit rounded-full border border-[color-mix(in_srgb,var(--ib-acc)_20%,var(--ib-line))] bg-[var(--ib-accbg)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--ib-acc)] sm:text-[11px]">
                {t("aiAssistantHome.isoAcademyBadge")}
              </div>
              <div className="font-mono text-[10px] text-[var(--ib-mute)]">
                {t("aiAssistantHome.codeAca")}
              </div>
            </div>
            <h3 className="relative z-[1] mb-0! mt-5 text-[22px] font-bold text-[var(--ib-ink)] sm:text-[24px]">
              {t("aiAssistantHome.isoAcademy")}
            </h3>
            <p className="relative z-[1] mt-3 max-w-2xl text-[14px] leading-relaxed text-[var(--ib-mute)] sm:text-[15px]">
              {t("aiAssistantHome.academyCardDesc")}
            </p>
            <Link
              href={`/${lang}/academy`}
              className="group/btn relative z-[1] mt-6 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-[var(--ib-acc)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
            >
              {t("aiAssistantHome.startLearning")}
              <ArrowRight
                className="size-4 transition-transform group-hover/btn:translate-x-1"
                aria-hidden
              />
            </Link>
          </motion.article>
        </div>
      </section>

      <div className="bg-[var(--ib-bg)] pb-24">
        <ReviewSection />
      </div>

      <Footer />
    </div>
  );
};

export default AIAssistantHome;
