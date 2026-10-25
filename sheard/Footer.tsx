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

  const footerLinks = [
    {
      id: "product",
      title: t("footer.product") || "Product",
      links: [
        { label: t("nav.library") || "Library", href: `/${lang}/library/iso-standards` },
        { label: t("nav.academy") || "Academy", href: `/${lang}/academy` },
        { label: t("nav.masteryLab") || "Mastery Lab", href: `/${lang}/mastery-lab` },
        { label: t("nav.pricing") || "Pricing", href: `/${lang}/pricing` },
      ],
    },
    {
      id: "company",
      title: t("footer.company") || "Company",
      links: [
        { label: t("nav.about") || "About", href: `/${lang}/about` },
        { label: t("footer.contact") || "Contact", href: `/${lang}/contact` },
        { label: t("footer.careers") || "Careers", href: "#" },
        {
          label: "Refund & Cancellation",
          href: `/${lang}/refund-and-cancellation`,
        },
      ],
    },
    {
      id: "legal",
      title: t("footer.legal") || "Legal",
      links: [
        {
          label: t("footer.privacy") || "Privacy Policy",
          href: `/${lang}/privacy-policy`,
        },
        {
          label: t("footer.terms") || "Terms of Service",
          href: `/${lang}/terms-of-service`,
        },
        {
          label: t("footer.cookiePolicy") || "Cookie Policy",
          href: `/${lang}/cookie-policy`,
        },
      ],
    },
  ];

  return (
    <footer className="border-t border-[var(--ib-line)] bg-[var(--ib-bg)] py-12 text-sm text-[var(--ib-mute)]">
      <div className="ib-w grid grid-cols-2 gap-7 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Link
            href={`/${lang}/`}
            className="mb-2 inline-flex items-center gap-2.5 font-semibold text-[var(--ib-ink)]"
          >
            <span className="relative size-9 shrink-0 overflow-hidden rounded-lg">
              <Image
                src="/Icon.png"
                alt="ISOBrain"
                width={36}
                height={36}
                className="animate-brain-spin object-contain"
              />
            </span>
            <b className="text-base font-semibold">ISOBrain.AI</b>
          </Link>
          <p className="mt-2">
            AI-powered platform for understanding and applying ISO management
            standards.
          </p>
        </div>
        {footerLinks.map((section) => (
          <div key={section.id}>
            <b className="mb-2 block font-semibold text-[var(--ib-ink)]">
              {section.title}
            </b>
            {section.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block leading-[2] hover:text-[var(--ib-ink)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
