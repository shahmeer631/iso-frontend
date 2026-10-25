"use client";

import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import ISOStandardsNexus from "@/components/Library/iso-standards/ISOStandardsNexus";
import {
  ArrowRight,
  Search,
  Command,
  X,
  BookOpen,
  Library,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useParams, useRouter, useSearchParams, usePathname } from "next/navigation";
import { useGetCategoriesQuery } from "@/lib/redux/api/isoStandardsApi";
import "@/lib/i18n/client";
import { useSelector } from "react-redux";
import { useGetPlansQuery, Plan } from "@/lib/redux/features/pricing/pricingApi";
import { useCreatePaymentIntentMutation } from "@/lib/redux/features/payments/paymentApi";
import { selectCurrentUser, selectCurrentToken } from "@/lib/redux/features/auth/authSlice";
import { toast } from "sonner";
import { userHasFeature, userOwnsPlanId } from "@/lib/access/effectiveAccess";

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

const Page = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initialSearch = searchParams.get("search") || "";
  const categoryInUrl = searchParams.get("category") || "all";

  const { data: response } = useGetPlansQuery();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [inputValue, setInputValue] = useState(initialSearch);
  const [isBarFocused, setIsBarFocused] = useState(false);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  const reduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, i18n } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";
  const isRTL = i18n.language === "ar";

  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.data || [];

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
  const plan = plans.find((p) => p.name?.toLowerCase().includes("plus")) || plans[1];
  const isPurchased =
    userOwnsPlanId(user, plan?.id || plan?._id) || userHasFeature(user, "LIBRARY");

  const handlePlanSelect = async (selectedPlan: Plan) => {
    if (isPurchased) {
      router.push(`/${lang}/academy`);
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
          t(
            "pricingPage.paymentError",
            "Failed to initiate payment. Please try again."
          )
        );
      }
    } finally {
      setProcessingPlanId(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(inputValue.trim()), 350);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleKeydown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        router.push(`/${lang}/library/iso-standards/explorer`);
      }
      if (e.key === "Escape") inputRef.current?.blur();
    },
    [lang, router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [handleKeydown]);

  const setCategoryFilter = (categoryName: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (!categoryName || categoryName === "all") {
      next.delete("category");
    } else {
      next.set("category", categoryName);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const clearSearch = () => {
    setInputValue("");
    setSearchTerm("");
  };

  // handlePlanSelect retained for Plus checkout flows triggered from pricing CTA paths
  void processingPlanId;
  void handlePlanSelect;

  return (
    <div
      className="min-h-screen bg-[var(--ib-bg)] font-inter text-[var(--ib-ink)] selection:bg-[var(--ib-acc)] selection:text-white"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* ── Library Hero ─────────────────────────────────── */}
      <header className="relative overflow-x-clip px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0"
        >
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
              <Library className="size-3.5" aria-hidden />
              {t("library.heroBadge")}
            </div>

            <h1 className="mb-0! mt-3 text-[32px] font-bold leading-[1.12] tracking-[-0.035em] text-[var(--ib-ink)] sm:text-[40px] lg:text-[48px]">
              {t("library.heading")}
            </h1>

            <p className="mx-auto mt-4 max-w-[560px] text-[15px] leading-relaxed text-[var(--ib-mute)] sm:text-[16.5px]">
              {t("library.description")}
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.08, ease }}
            className="mx-auto mt-8 w-full max-w-[640px]"
          >
            <label htmlFor="iso-library-search" className="sr-only">
              {t("library.searchPlaceholder")}
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
                id="iso-library-search"
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setIsBarFocused(true)}
                onBlur={() => setIsBarFocused(false)}
                placeholder={t("library.searchPlaceholder")}
                className="min-w-0 flex-1 border-none bg-transparent text-[15px] text-[var(--ib-ink)] outline-none placeholder:text-[var(--ib-mute)]"
                autoComplete="off"
              />
              {inputValue ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-[var(--ib-mute)] transition-colors hover:bg-[var(--ib-accbg)] hover:text-[var(--ib-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
                  aria-label={t("library.showAll")}
                >
                  <X className="size-4" />
                </button>
              ) : (
                <div className="hidden items-center gap-1 rounded-md border border-[var(--ib-line)] bg-[var(--ib-bg)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--ib-mute)] md:inline-flex">
                  <Command className="size-2.5" aria-hidden />
                  <span>K</span>
                </div>
              )}
            </div>
            <p className="mt-2.5 text-center text-[12px] text-[var(--ib-mute)]">
              {t("library.hint")}
            </p>
          </motion.div>

          {/* Category chips */}
          {categories.length > 0 ? (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.14, ease }}
              className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-center gap-2"
              role="group"
              aria-label={t("library.head")}
            >
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)] ${
                  categoryInUrl === "all" || !searchParams.get("category")
                    ? "border-[var(--ib-acc)] bg-[var(--ib-acc)] text-white shadow-[0_8px_20px_-12px_var(--ib-acc)]"
                    : "border-[var(--ib-line)] bg-[var(--ib-card)] text-[var(--ib-mute)] hover:border-[color-mix(in_srgb,var(--ib-acc)_30%,var(--ib-line))] hover:text-[var(--ib-ink)]"
                }`}
              >
                {t("library.showAll")}
              </button>
              {categories.slice(0, 8).map((cat: { id: string; name: string }) => {
                const selected =
                  categoryInUrl.toLowerCase() === cat.name.toLowerCase();
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.name)}
                    className={`max-w-[200px] truncate rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)] ${
                      selected
                        ? "border-[var(--ib-acc)] bg-[var(--ib-acc)] text-white shadow-[0_8px_20px_-12px_var(--ib-acc)]"
                        : "border-[var(--ib-line)] bg-[var(--ib-card)] text-[var(--ib-mute)] hover:border-[color-mix(in_srgb,var(--ib-acc)_30%,var(--ib-line))] hover:text-[var(--ib-ink)]"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </motion.div>
          ) : null}
        </div>
      </header>

      {/* ── Plus upsell (non-purchased) ───────────────────── */}
      {!isPurchased && (
        <section className="relative overflow-x-clip border-y border-[var(--ib-line)] bg-[color-mix(in_srgb,var(--ib-card)_70%,var(--ib-accbg))] px-4 py-12 sm:px-6 sm:py-16">
          <div className="ib-w max-w-7xl!">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <div className="ib-eye mb-3 inline-flex items-center gap-2">
                <BookOpen className="size-3.5" aria-hidden />
                {t("library.plusSecureSpot")}
              </div>

              <h2 className="mb-0! text-[24px] font-bold tracking-[-0.03em] text-[var(--ib-ink)] sm:text-[30px]">
                ISOBrain Plus –{" "}
                <span className="text-[var(--ib-acc)]">{t("library.plusPlanPrice")}</span>
              </h2>

              <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-[var(--ib-mute)] sm:text-[15.5px]">
                {t("library.plusEssentialToolkit")}
              </p>
              <p className="mt-2 max-w-lg text-[13px] italic leading-relaxed text-[var(--ib-mute)] sm:text-[14px]">
                {t("library.plusPerfectFor")}
              </p>

              <p className="mt-5 text-[16px] font-semibold text-[var(--ib-ink)] sm:text-[18px]">
                {t("library.plusTakeSkills")}
              </p>

              <button
                type="button"
                onClick={() => router.push(`/${lang}/pricing`)}
                className="group mt-5 inline-flex items-center justify-center gap-2.5 rounded-[12px] bg-[var(--ib-acc)] px-7 py-3.5 text-[13px] font-bold uppercase tracking-wider text-white shadow-[0_14px_32px_-14px_rgba(27,77,219,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)] sm:text-[14px]"
              >
                <span>{t("library.plusCta")}</span>
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
              </button>

              {/* Countdown */}
              <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)] px-5 py-4 shadow-sm sm:gap-4 sm:px-8 sm:py-5">
                {[
                  { key: "hours", label: t("library.countdownHours"), value: timeLeft.hours },
                  { key: "mins", label: t("library.countdownMins"), value: timeLeft.minutes },
                  {
                    key: "secs",
                    label: t("library.countdownSecs"),
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

            {/* Benefits */}
            <div className="mx-auto mt-14 max-w-5xl border-t border-[var(--ib-line)] pt-12 text-center">
              <h3 className="mb-0! text-[18px] font-semibold uppercase tracking-wider text-[var(--ib-ink)] sm:text-[20px]">
                {t("library.forUsd30YouGet")}
              </h3>
              <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-10 md:gap-y-10">
                {[
                  { title: t("library.benefit1Title"), desc: t("library.benefit1Desc") },
                  { title: t("library.benefit2Title"), desc: t("library.benefit2Desc") },
                  { title: t("library.benefit3Title"), desc: t("library.benefit3Desc") },
                  { title: t("library.benefit4Title"), desc: t("library.benefit4Desc") },
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

      {/* ── Purchased value matrix ───────────────────────── */}
      {isPurchased && (
        <section className="px-4 py-12 sm:px-6 sm:py-16">
          <div className="ib-w max-w-7xl!">
            <h2 className="mb-8 text-center text-[26px] font-semibold leading-[1.25] text-[var(--ib-ink)] sm:mb-12 sm:text-[34px]">
              {t("library.libraryAcceleratesTitle")}
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)] shadow-[0_18px_40px_-28px_rgba(11,18,32,0.25)]">
              <table className="w-full min-w-[800px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--ib-line)] bg-[var(--ib-bg)]">
                    <th className="w-1/3 p-5 text-[18px] font-medium text-[var(--ib-ink)] sm:p-6 sm:text-[20px]">
                      {t("library.tableOldWay")}
                    </th>
                    <th className="w-1/3 border-l border-[var(--ib-line)] p-5 text-[18px] font-medium text-[var(--ib-acc)] sm:p-6 sm:text-[20px]">
                      {t("library.tableNewWay")}
                    </th>
                    <th className="w-1/3 border-l border-[var(--ib-line)] p-5 text-[18px] font-medium text-[var(--ib-ink)] sm:p-6 sm:text-[20px]">
                      {t("library.tableCareerValue")}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[14px] leading-[1.6] text-[var(--ib-mute)] sm:text-[16px]">
                  <tr className="border-b border-[var(--ib-line)]">
                    <td className="p-5 align-top sm:p-6">
                      <strong className="mb-2 block text-[var(--ib-ink)]">
                        {t("library.tableRow1OldTitle")}
                      </strong>
                      {t("library.tableRow1OldDesc")}
                    </td>
                    <td className="border-l border-[var(--ib-line)] bg-[var(--ib-accbg)] p-5 align-top sm:p-6">
                      <strong className="mb-2 block text-[var(--ib-acc)]">
                        {t("library.tableRow1NewTitle")}
                      </strong>
                      {t("library.tableRow1NewDesc")}
                    </td>
                    <td className="border-l border-[var(--ib-line)] p-5 align-top sm:p-6">
                      <strong className="mb-2 block text-[var(--ib-ink)]">
                        {t("library.tableRow1ValTitle")}
                      </strong>
                      {t("library.tableRow1ValDesc")}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-5 align-top sm:p-6">
                      <strong className="mb-2 block text-[var(--ib-ink)]">
                        {t("library.tableRow2OldTitle")}
                      </strong>
                      {t("library.tableRow2OldDesc")}
                    </td>
                    <td className="border-l border-[var(--ib-line)] bg-[var(--ib-accbg)] p-5 align-top sm:p-6">
                      <strong className="mb-2 block text-[var(--ib-acc)]">
                        {t("library.tableRow2NewTitle")}
                      </strong>
                      {t("library.tableRow2NewDesc")}
                    </td>
                    <td className="border-l border-[var(--ib-line)] p-5 align-top sm:p-6">
                      <strong className="mb-2 block text-[var(--ib-ink)]">
                        {t("library.tableRow2ValTitle")}
                      </strong>
                      {t("library.tableRow2ValDesc")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── Standards grid ───────────────────────────────── */}
      <ISOStandardsNexus searchTerm={searchTerm} />

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="px-4 pb-20 pt-6 sm:px-6 sm:pb-28 sm:pt-10">
        <div className="ib-w max-w-5xl!">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45, ease }}
            className="relative overflow-hidden rounded-[24px] bg-[var(--ib-acc)] px-6 py-12 text-center sm:rounded-[32px] sm:px-12 sm:py-16 md:px-16 md:py-20"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,255,255,0.18),transparent_55%)]"
            />
            <div className="relative z-[1] flex flex-col items-center">
              <h2 className="mb-0! text-[26px] font-semibold leading-[1.25] text-white sm:text-[34px]">
                {t("library.ctaTitle")}
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] font-medium leading-relaxed text-white/85 sm:text-[17px]">
                {t("library.ctaDesc")}
              </p>
              <Link
                href={`/${lang}/library/iso-standards/explorer`}
                className="mt-8 inline-flex items-center gap-2.5 rounded-[10px] bg-white px-8 py-4 text-[12px] font-bold uppercase tracking-[1px] text-[var(--ib-ink)] transition-opacity hover:opacity-92 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-10 sm:py-5 sm:text-[14px]"
              >
                {t("library.ctaBtn")}
                <ArrowRight className="size-5" aria-hidden />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Page;
