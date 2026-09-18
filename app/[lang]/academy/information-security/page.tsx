"use client";

import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";
import { Shield, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function InfoSecurityPage() {
  const { t } = useTranslation();
  const { lang } = useParams();

  return (
    <div className="bg-[#0F111A] text-white min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8 text-[#B026FF]">
            <Shield size={32} />
            <h1 className="space-grotesk text-4xl md:text-6xl font-bold">
              {t("academy.infoSecurity.title")}
            </h1>
          </div>
          <h2 className="space-grotesk text-2xl md:text-3xl font-bold mb-8 text-white/90">
            {t("academy.infoSecurity.subtitle")}
          </h2>
          <p className="text-[#A1A1A6] text-xl leading-relaxed mb-12 font-inter">
            {t("academy.infoSecurity.description")}
          </p>
          <Link
            href={`/${lang}/signup`}
            className="inline-flex items-center gap-3 bg-[#B026FF] text-white font-bold px-10 py-5 rounded-2xl hover:scale-105 transition-transform"
          >{t('academy.startForFree')}<ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
