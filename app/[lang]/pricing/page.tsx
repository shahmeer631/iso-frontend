"use client";

import PricingSection from "@/components/landing-page-components/PricingSection";
import PricingFAQ from "@/components/landing-page-components/PricingFAQ";
import OfferTimer from "@/components/landing-page-components/OfferTimer";
import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname, useParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n/client";
import { motion, useReducedMotion } from "framer-motion";
import { CreditCard } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const PricingContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { lang } = useParams();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang as string);
    }
  }, [lang]);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast.error(decodeURIComponent(error));
      const params = new URLSearchParams(searchParams.toString());
      params.delete("error");
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl);
    }
  }, [searchParams, router, pathname]);

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
              <CreditCard className="size-3.5" aria-hidden />
              {t("pricingPage.simplePricing")}
            </div>

            <h1 className="mb-0! mt-3 text-[36px] font-bold leading-[1.1] tracking-[-0.035em] text-[var(--ib-ink)] sm:text-[44px] lg:text-[52px]">
              {t("pricingPage.title")}
            </h1>

            <p className="mt-4 text-[16px] font-semibold text-[var(--ib-mute)] sm:text-[17px]">
              {t("pricingPage.tagline")}
            </p>

            <div className="mx-auto mt-4 max-w-2xl space-y-2 text-[14px] leading-relaxed text-[var(--ib-mute)] sm:text-[15px]">
              <p>{t("pricingPage.desc1")}</p>
              <p>{t("pricingPage.desc2")}</p>
            </div>

            <p className="mt-5 text-[12px] font-medium text-[var(--ib-mute)] sm:text-[13px]">
              {t("pricingPage.priceNote")}
            </p>
          </motion.div>
        </div>
      </header>

      <OfferTimer />
      <PricingSection />
      <PricingFAQ />
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
