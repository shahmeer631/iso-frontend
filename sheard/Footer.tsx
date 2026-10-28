"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

const Footer = () => {
  const pathname = usePathname();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const { t } = useTranslation();

  if (pathname.includes("/library/iso-standards/chat")) {
    return null;
  }

  const links = [
    { label: t("nav.library") || "Library", href: `/${lang}/library/iso-standards` },
    { label: t("nav.academy") || "Academy", href: `/${lang}/academy` },
    { label: t("nav.masteryLab") || "Mastery Lab", href: `/${lang}/mastery-lab` },
    { label: t("nav.pricing") || "Pricing", href: `/${lang}/pricing` },
    { label: t("nav.about") || "About", href: `/${lang}/about` },
    { label: t("footer.contact") || "Contact", href: `/${lang}/contact` },
    {
      label: t("footer.privacy") || "Privacy",
      href: `/${lang}/privacy-policy`,
    },
    {
      label: t("footer.terms") || "Terms",
      href: `/${lang}/terms-of-service`,
    },
    {
      label: t("footer.cookiePolicy") || "Cookies",
      href: `/${lang}/cookie-policy`,
    },
  ];

  return (
    <footer className="border-t border-[var(--ib-line)] bg-[var(--ib-bg)] py-6 text-sm text-[var(--ib-mute)] sm:py-7">
      <div className="ib-w flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 flex-col gap-1.5 sm:max-w-[320px]">
          <Link
            href={`/${lang}/`}
            className="inline-flex items-center gap-2 font-semibold text-[var(--ib-ink)]"
          >
            <span className="relative size-8 shrink-0 overflow-hidden rounded-lg">
              <Image
                src="/Icon.png"
                alt="ISOBrain"
                width={32}
                height={32}
                className="animate-brain-spin object-contain"
              />
            </span>
            <b className="text-[15px] font-semibold">ISOBrain.AI</b>
          </Link>
          <p className="text-[12.5px] leading-snug">
            Assess · Learn · Master · Apply — one system for ISO standards.
          </p>
        </div>

        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:justify-end"
        >
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[12.5px] font-medium text-[var(--ib-mute)] transition-colors hover:text-[var(--ib-ink)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
