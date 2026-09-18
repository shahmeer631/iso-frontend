import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr", "es", "de", "it", "pt", "ar", "ru", "mg"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});
