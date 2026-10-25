"use client";

import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";
import { HeartPulse, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function HealthSafetyPage() {
  const { t } = useTranslation();
  const { lang } = useParams();

  return (
    <div className="bg-[var(--ib-bg)] text-[var(--ib-ink)] min-h-screen pt-12 pb-20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8 text-[#EF4444]">
            <HeartPulse size={32} />
            <h1 className="text-4xl md:text-6xl font-bold">
              {t("academy.healthSafety.title")}
            </h1>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-[var(--ib-ink)]/90">
            {t("academy.healthSafety.subtitle")}
          </h2>
          <p className="text-[var(--ib-mute)] text-xl leading-relaxed mb-12 font-inter">
            {t("academy.healthSafety.description")}
          </p>
          <Link
            href={`/${lang}/signup`}
            className="inline-flex items-center gap-3 bg-[#EF4444] text-white font-bold px-10 py-5 rounded-[10px] hover:opacity-90 transition-transform"
          >{t('academy.startForFree')}<ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
