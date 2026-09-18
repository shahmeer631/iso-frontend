import { getRequestConfig } from "next-intl/server";

const SUPPORTED_LOCALES = ["en", "fr", "es", "de", "it", "pt", "ar", "ru", "mg"];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Fallback to "en" if locale is undefined or not in supported list
  if (!locale || !SUPPORTED_LOCALES.includes(locale)) {
    locale = "en";
  }

  // Load translations from client.ts for English, fallback to JSON for other languages
  let messages;
  if (locale === "en") {
    const { commonEN } = await import("./lib/i18n/client");
    messages = commonEN;
  } else {
    // Fallback to JSON files for other languages
    try {
      messages = (await import(`./messages/${locale}.json`)).default;
    } catch {
      // If translation file doesn't exist, use English as fallback
      const { commonEN } = await import("./lib/i18n/client");
      messages = commonEN;
    }
  }

  return {
    locale,
    messages,
  };
});
