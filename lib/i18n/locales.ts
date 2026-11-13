/**
 * Canonical locale contract for ISOBrain.AI (main website).
 * Keep in sync with backend `src/helpars/locales.ts` and dashboard `lib/locales.ts`.
 */

export const SUPPORTED_LOCALES = ["en", "es", "ar", "fr", "it", "hi"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";

export const RTL_LOCALES: readonly AppLocale[] = ["ar"];

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "English",
  es: "Español",
  ar: "العربية",
  fr: "Français",
  it: "Italiano",
  hi: "हिन्दी",
};

export const LOCALE_AI_LANGUAGE: Record<AppLocale, string> = {
  en: "English",
  es: "Spanish",
  ar: "Arabic",
  fr: "French",
  it: "Italian",
  hi: "Hindi",
};

export function isAppLocale(value: unknown): value is AppLocale {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

export function normalizeLocale(value: unknown): AppLocale {
  if (isAppLocale(value)) return value;
  if (typeof value === "string") {
    const base = value.toLowerCase().split("-")[0];
    if (isAppLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

export function isRtlLocale(locale: string): boolean {
  return (RTL_LOCALES as readonly string[]).includes(normalizeLocale(locale));
}

export function localeToAiLanguage(locale: string): string {
  return LOCALE_AI_LANGUAGE[normalizeLocale(locale)];
}
