import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LOCALES = ["en", "fr", "es", "de", "it", "pt", "ar", "ru", "mg"] as const;
type Locale = typeof SUPPORTED_LOCALES[number];

const intlMiddleware = createMiddleware({
  locales: SUPPORTED_LOCALES,
  defaultLocale: "en",
  localePrefix: "as-needed",
});

// Routes that require authentication (without locale prefix)
const PROTECTED_PATHS: string[] = [];

const LOCALE_REGEX = new RegExp(`^\\/(${SUPPORTED_LOCALES.join("|")})`);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix to get the raw path
  const pathnameWithoutLocale = pathname.replace(LOCALE_REGEX, "") || "/";

  const isProtected = PROTECTED_PATHS.some(
    (p) =>
      pathnameWithoutLocale === p || pathnameWithoutLocale.startsWith(p + "/")
  );

  if (isProtected) {
    const token = request.cookies.get("token");
    if (!token?.value) {
      const localeMatch = pathname.match(LOCALE_REGEX);
      const locale = (localeMatch?.[1] as Locale) ?? "en";
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)", // Match all routes except _next and static files
  ],
};
