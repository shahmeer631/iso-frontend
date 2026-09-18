"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

const LOCALES = {
  en: "EN",
  fr: "FR",
  es: "ES",
  de: "DE",
  it: "IT",
  pt: "PT",
  ar: "AR",
  ru: "RU",
  mg: "MG",
} as const;

type Locale = keyof typeof LOCALES;



export function useGoogleTranslate() {
  // return;
  const pathname = usePathname();
  const locale = useLocale();

  // ---- 1️⃣ Load Google Translate script once ----
  useEffect(() => {
    if (window.googleTranslateLoaded) return;

    window.googleTranslateElementInit = () => {
      try {
        new window.google!.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,fr,es,bn",
            layout: window.google?.translate?.InlineLayout?.SIMPLE,
            autoDisplay: false,
            multilanguagePage: true,
          },
          "google_translate_element"
        );
        window.googleTranslateLoaded = true;
        console.log("✅ Google Translate initialized");
      } catch (err) {
        console.error("Google Translate init error:", err);
      }
    };

    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    const style = document.createElement("style");
    style.innerHTML = `
      .goog-te-banner-frame,
      .goog-te-gadget-icon,
      .goog-te-menu-frame,
      .goog-te-balloon-frame,
      .goog-te-combo,
      .skiptranslate,
      iframe.skiptranslate {
        display: none !important;
        visibility: hidden !important;
      }
      body { top: 0 !important; }
      [class^="VIpgJd-ZVi9od"] {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      // script.remove();
      // style.remove();
    };
  }, []);

  // ---- 2️⃣ Re-apply translation immediately when locale changes ----
  useEffect(() => {
    const validLocales = Object.keys(LOCALES) as Locale[];
    const detectedLocale = validLocales.includes(locale as Locale)
      ? (locale as Locale)
      : "en";

    // Update googtrans cookie
    const cookieValue = detectedLocale === "en" ? "" : `/en/${detectedLocale}`;
    document.cookie = `googtrans=${cookieValue}; path=/; secure; samesite=strict; max-age=31536000`;

    // Apply translation instantly (no reload)
    const applyTranslation = () => {
      const select =
        document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (select) {
        select.value = detectedLocale;
        // Dispatch change event to trigger translation instantly
        select.dispatchEvent(new Event("change"));
        console.log("🌍 Applied translation instantly:", detectedLocale);
      } else {
        console.warn("⚠️ Google Translate selector not ready yet.");
      }
    };

    // Wait for Google to load, then apply
    const timeout = setTimeout(() => {
      if (window.googleTranslateLoaded) {
        applyTranslation();
      } else {
        // Wait a bit longer if not yet loaded
        const retry = setInterval(() => {
          if (window.googleTranslateLoaded) {
            applyTranslation();
            clearInterval(retry);
          }
        }, 4000);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [locale, pathname]);
}
