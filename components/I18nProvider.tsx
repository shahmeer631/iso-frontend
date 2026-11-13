"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import "@/lib/i18n/client";
import i18n from "@/lib/i18n/client";
import {
  DEFAULT_LOCALE,
  isRtlLocale,
  normalizeLocale,
} from "@/lib/i18n/locales";

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();

  useEffect(() => {
    const urlLang = params?.lang as string | undefined;
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("preferredLanguage")
        : null;
    const lang = normalizeLocale(urlLang || saved || DEFAULT_LOCALE);

    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }

    document.documentElement.dir = isRtlLocale(lang) ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-locale", lang);

    try {
      localStorage.setItem("preferredLanguage", lang);
    } catch {
      /* ignore */
    }
  }, [params?.lang]);

  return <>{children}</>;
}
