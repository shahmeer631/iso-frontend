"use client";

import PricingSection from "@/components/landing-page-components/PricingSection";
import PricingFAQ from "@/components/landing-page-components/PricingFAQ";
import LtdAnnouncementBar from "@/components/lifetime-deal/LtdAnnouncementBar";
import LtdPricingCards from "@/components/lifetime-deal/LtdPricingCards";
import React, { useCallback, useEffect, useState, Suspense } from "react";
import {
  useSearchParams,
  useRouter,
  usePathname,
  useParams,
} from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n/client";
import { motion, useReducedMotion } from "framer-motion";
import { CreditCard, Sparkles } from "lucide-react";
import { useGetLifetimeDealStatusQuery } from "@/lib/redux/features/lifetimeDeal/lifetimeDealApi";
import {
  isLtdOfferLive,
  ltdStatusPollingIntervalMs,
  shouldShowAnnualPricing,
} from "@/lib/lifetimeDeal/countdown";
import { STANDARD_ANNUAL_PRICES } from "@/lib/lifetimeDeal/types";

const ease = [0.22, 1, 0.36, 1] as const;

const PricingContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { lang } = useParams();
  const reduceMotion = useReducedMotion();
  const [statusPollMs, setStatusPollMs] = useState(30_000);

  const {
    data: ltdResponse,
    isLoading: ltdLoading,
    isError: ltdError,
    refetch: refetchLtd,
  } = useGetLifetimeDealStatusQuery(undefined, {
    // Backend UTC is the source of truth — poll while live so annual restores without a manual visit
    pollingInterval: statusPollMs,
  });

  const promotion = ltdResponse?.data ?? null;
  const showLtd = isLtdOfferLive(promotion);
  const showAnnual =
    !showLtd &&
    !ltdLoading &&
    (ltdError || shouldShowAnnualPricing(promotion));

  const annualPlus =
    promotion?.standardAnnualPrices?.plus ?? STANDARD_ANNUAL_PRICES.PLUS;
  const annualPro =
    promotion?.standardAnnualPrices?.pro ?? STANDARD_ANNUAL_PRICES.PRO;
  const annualUltra =
    promotion?.standardAnnualPrices?.ultra ?? STANDARD_ANNUAL_PRICES.ULTRA;

  useEffect(() => {
    if (showLtd) {
      setStatusPollMs(ltdStatusPollingIntervalMs(promotion?.remainingMs));
    } else {
      setStatusPollMs(0);
    }
  }, [showLtd, promotion?.remainingMs]);

  // Schedule a server-driven refetch at remainingMs (not a local invented deadline)
  useEffect(() => {
    if (!showLtd || !promotion) return;
    const delay = Math.max(0, promotion.remainingMs) + 150;
    const id = window.setTimeout(() => {
      void refetchLtd();
    }, delay);
    return () => window.clearTimeout(id);
  }, [showLtd, promotion?.remainingMs, promotion?.endsAt, refetchLtd]);

  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang as string);
    }
  }, [lang]);

  useEffect(() => {
    const error = searchParams.get("error");
    const ltd = searchParams.get("ltd");
    if (!error && !ltd) return;

    if (error) {
      toast.error(decodeURIComponent(error));
    }

    // Success redirect only confirms payment UI — entitlements activate in Phase 5
    if (ltd === "success") {
      toast.success(
        t(
          "ltd.checkoutSuccessPendingAccess",
          "Payment received. Lifetime access will be activated shortly.",
        ),
      );
    } else if (ltd === "cancelled") {
      toast.message(
        t(
          "ltd.checkoutCancelled",
          "Checkout cancelled. You can claim a lifetime plan anytime while the offer is live.",
        ),
      );
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");
    params.delete("ltd");
    params.delete("session_id");
    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.replace(newUrl);
  }, [searchParams, router, pathname, t]);

  const handleCountdownExpired = useCallback(() => {
    void refetchLtd();
  }, [refetchLtd]);

  return (
    <div className="min-h-screen bg-[var(--ib-bg)] font-inter text-[var(--ib-ink)] selection:bg-[var(--ib-accbg)] selection:text-[var(--ib-acc)]">
      <header className="relative overflow-x-clip px-4 pb-6 pt-12 sm:px-6 sm:pb-8 sm:pt-16">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-16%] h-[480px] w-[min(900px,100%)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--ib-acc)_14%,transparent),transparent_70%)]" />
        </div>

        <div className="ib-w relative z-[1] max-w-3xl! text-center">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="ib-eye mx-auto inline-flex items-center gap-2">
              {showLtd ? (
                <Sparkles className="size-3.5" aria-hidden />
              ) : (
                <CreditCard className="size-3.5" aria-hidden />
              )}
              {showLtd
                ? t("ltd.heroEyebrow", "7-Day Lifetime Access Event")
                : t("pricingPage.simplePricing")}
            </div>

            <h1 className="mb-0! mt-3 text-[32px] font-bold leading-[1.1] tracking-[-0.035em] text-[var(--ib-ink)] sm:text-[42px] lg:text-[50px]">
              {showLtd
                ? t(
                    "ltd.heroHeadline",
                    "Lock In Lifetime Access to ISOBrain.AI — Pay Once, Never Subscribe Again",
                  )
                : t("pricingPage.title")}
            </h1>

            <p className="mt-4 text-[15px] font-semibold text-[var(--ib-mute)] sm:text-[17px]">
              {showLtd
                ? t(
                    "ltd.heroSubheadline",
                    "For the next 7 days only, get permanent access to our ISO Library, Mastery Lab, Academy, and AI Compliance Suite with a single one-time payment. No monthly fees. No annual renewals.",
                  )
                : t("pricingPage.tagline")}
            </p>

            {!showLtd ? (
              <div className="mx-auto mt-4 max-w-2xl space-y-2 text-[14px] leading-relaxed text-[var(--ib-mute)] sm:text-[15px]">
                <p>{t("pricingPage.desc1")}</p>
                <p>{t("pricingPage.desc2")}</p>
              </div>
            ) : null}

            <p className="mt-5 text-[12px] font-medium text-[var(--ib-mute)] sm:text-[13px]">
              {showLtd
                ? t(
                    "ltd.trustMicrocopy",
                    "Pricing in USD · One-Time Payment · Lifetime Access · ISO 27001 & SOC2 Compliant",
                  )
                : t("pricingPage.priceNote")}
            </p>
          </motion.div>
        </div>
      </header>

      {ltdLoading && !promotion ? (
        <div className="mx-auto mb-10 flex max-w-4xl justify-center px-4">
          <div className="h-28 w-full max-w-xl animate-pulse rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)]" />
        </div>
      ) : null}

      {showLtd && promotion ? (
        <>
          <LtdAnnouncementBar
            promotion={promotion}
            onExpired={handleCountdownExpired}
          />
          <LtdPricingCards promotion={promotion} />
          <PricingFAQ lifetimeMode />
        </>
      ) : null}

      {showAnnual ? (
        <>
          {promotion?.status === "EXPIRED" ||
          promotion?.status === "DISABLED" ||
          promotion?.pricingMode === "ANNUAL" ? (
            <div className="mx-auto mb-6 max-w-3xl px-4 text-center">
              <p className="rounded-xl border border-[var(--ib-line)] bg-[var(--ib-card)] px-4 py-3 text-[14px] font-medium text-[var(--ib-mute)]">
                {promotion?.status === "SCHEDULED"
                  ? t(
                      "ltd.offerNotStarted",
                      "The Lifetime Access Event has not started yet. Standard annual plans are available below.",
                    )
                  : t(
                      "ltd.offerEnded",
                      "The 7-Day Lifetime Access Offer Has Ended. Standard Subscription Plans Apply.",
                    )}
              </p>
              {(promotion?.status === "EXPIRED" ||
                promotion?.status === "DISABLED") && (
                <p className="mt-2 text-[13px] text-[var(--ib-mute)]">
                  {t(
                    "ltd.standardAnnualPrices",
                    "Plus ${{plus}}/year · Pro ${{pro}}/year · Ultra ${{ultra}}/year",
                    {
                      plus: annualPlus,
                      pro: annualPro,
                      ultra: annualUltra,
                    },
                  )}
                </p>
              )}
            </div>
          ) : null}
          <PricingSection />
          <PricingFAQ lifetimeMode={false} />
        </>
      ) : null}
    </div>
  );
};

const PricingPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--ib-bg)] text-[var(--ib-mute)]">
          Loading...
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
};

export default PricingPage;
