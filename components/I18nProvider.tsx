"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import "@/lib/i18n/client"; // initialize i18next
import i18n from "@/lib/i18n/client";

const SUPPORTED_LOCALES = ["en", "fr", "es", "de", "it", "pt", "ar", "ru", "mg"];

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();

  useEffect(() => {
    const urlLang = params?.lang as string;
    const lang = SUPPORTED_LOCALES.includes(urlLang) ? urlLang : "en";

    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }

    // Set html dir for RTL languages (Arabic)
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [params?.lang]);

  return <>{children}</>;
}
