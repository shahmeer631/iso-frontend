import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./locales";

export const routing = defineRouting({
  locales: [...SUPPORTED_LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  // "always" keeps /en/... in the URL. With "as-needed", next-intl stripped the
  // default locale prefix and nested App Router routes (e.g. /library/iso-standards)
  // resolved to the root 404 even though app/[lang]/... pages exist.
  localePrefix: "always",
});
