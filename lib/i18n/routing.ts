import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr", "es", "de", "it", "pt", "ar", "ru", "mg"],
  defaultLocale: "en",
  // "always" keeps /en/... in the URL. With "as-needed", next-intl stripped the
  // default locale prefix and nested App Router routes (e.g. /library/iso-standards)
  // resolved to the root 404 even though app/[lang]/... pages exist.
  localePrefix: "always",
});
