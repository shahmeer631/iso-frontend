"use client";

import DynamicHeroSectionWhiteButton from "@/components/landing-page-components/DynamicHeroSectionWhiteButton";
import PricingSection from "@/components/landing-page-components/PricingSection";
import PricingFAQ from "@/components/landing-page-components/PricingFAQ";
import OfferTimer from "@/components/landing-page-components/OfferTimer";
import ServerMaintenanceNotice from "@/components/landing-page-components/ServerMaintenanceNotice";
import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname, useParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n/client";
import Link from "next/link";

const PricingContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { lang } = useParams();

  // Sync i18n language with the URL [lang] param
  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang as string);
    }
  }, [lang]);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast.error(decodeURIComponent(error));

      // Clean up the URL by removing the error param
      const params = new URLSearchParams(searchParams.toString());
      params.delete("error");
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl);
    }
  }, [searchParams, router, pathname]);

  return (
    <div className="bg-[#0A0A0C] min-h-screen text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* header section  */}
      <section className="w-full pt-24 text-center text-white bg-[#0A0A0C]">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="space-grotesk text-5xl lg:text-[52px] font-semibold text-white leading-[1.1] tracking-tight mb-2">
            {t('pricingPage.title')}
          </h1>

          <div className="mt-8 mb-4 text-base font-semibold text-gray-300">
            {t('pricingPage.tagline')}
          </div>

          <div className="max-w-2xl mx-auto text-sm text-[#A1A1A6] font-inter mb-10 leading-relaxed space-y-3">
            <p>
              {t('pricingPage.desc1')}
            </p>
            <p>
              {t('pricingPage.desc2')}
            </p>
          </div>

          {/* <Link
            href={`/${lang}/mastery-lab`}
            style={{
              background: "#00F0FF", color: "#FFFFFF", padding: "16px 32px",
              borderRadius: 99, fontSize: 18, fontWeight: 700, cursor: "pointer",
              border: "none", display: "inline-block", alignItems: "center", gap: 8,
              transition: "all 0.2s"
            }}
          >{t('pricingPage.startAssessment')}</Link> */}
        </div>
      </section>



      {/* === TEMPORARY SERVER MAINTENANCE NOTICE (Delete this block when server work is completed) === */}
      {/* <ServerMaintenanceNotice /> */}
      {/* ============================================================================================== */}

      {/* offer timer section */}
      <OfferTimer />

      {/* pricing section  */}
      <PricingSection />
      {/* faq section */}
      <PricingFAQ />
    </div>
  );
};

const PricingPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PricingContent />
    </Suspense>
  );
};

export default PricingPage;
