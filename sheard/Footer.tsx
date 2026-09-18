"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import React from "react";
import { useTranslation } from "react-i18next";
import { Mail, Facebook, Twitter, Linkedin, Instagram, ArrowRight, ChevronDown, Globe, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "@/lib/i18n/client";

const Footer = () => {
  const pathname = usePathname();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const { t } = useTranslation();

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (pathname.includes("/library/iso-standards/chat")) {
    return null;
  }

  const footerLinks = [
    {
      id: "product",
      title: t('footer.product'),
      links: [
        { label: t('nav.library'), href: `/${lang}/library/iso-standards` },
        { label: t('nav.academy'), href: `/${lang}/academy` },
        { label: t('nav.masteryLab'), href: `/${lang}/mastery-lab` },
        { label: t('nav.pricing'), href: `/${lang}/pricing` },
      ]
    },
    {
      id: "company",
      title: t('footer.company'),
      links: [
        { label: t('nav.about'), href: `/${lang}/about` },
        { label: t('footer.contact'), href: "#" },
        { label: t('footer.careers'), href: "#" },
        { label: t('Refund & Cancellation Policy'), href: `/${lang}/refund-and-cancellation` },
      ]
    },
    {
      id: "legal",
      title: t('footer.legal'),
      links: [
        { label: t('footer.privacy'), href: `/${lang}/privacy-policy` },
        { label: t('footer.terms'), href: `/${lang}/terms-of-service` },
        { label: t('footer.cookiePolicy'), href: `/${lang}/cookie-policy` },
      ]
    }
  ];

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <footer className="bg-[#050506] text-white pt-10  px-6 lg:px-12 select-none border-t border-white/5 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full -z-10 animate-pulse" />

      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <Link href={`/${lang}/`} className="flex items-center gap-3 group w-fit">
              <div className="relative w-9 h-9 transition-transform duration-500 group-hover:rotate-[360deg]">
                <Image src="/Icon.png" alt={t('dynamic.dyn_icon_6')} fill className="object-contain" />
                <div className="absolute inset-0 rounded-lg bg-indigo-500/50 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                ISOBrain<span className="">{t('dynamic.dyn_aI_5')}</span>
              </span>
            </Link>

            <p className="text-[#A1A1A6] text-[15px] leading-relaxed max-w-sm">
              {t('hero.description')}
            </p>

            <div className="flex gap-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-400 hover:scale-110 transition-all duration-300 group shadow-lg">
                  <Icon size={18} className="text-[#A1A1A6] group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:grid md:grid-cols-3 lg:col-span-4 gap-8">
            {footerLinks.map((section) => (
              <div key={section.id} className="space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/30">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-[#A1A1A6] hover:text-[#E5E5E5] transition-all duration-300 text-[14px] font-medium flex items-center gap-2 group whitespace-nowrap">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mobile Accordion */}
          <div className="md:hidden lg:col-span-4 space-y-3">
            {footerLinks.map((section) => (
              <div key={section.id} className="border border-white/5 rounded-xl overflow-hidden bg-white/[0.01]">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-[12px] font-bold uppercase tracking-widest text-white/60">{section.title}</span>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${expandedSection === section.id ? "rotate-180 text-indigo-500" : "text-gray-500"}`} />
                </button>
                <AnimatePresence>
                  {expandedSection === section.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <ul className="px-5 pb-5 space-y-3">
                        {section.links.map((link) => (
                          <li key={link.label}>
                            <Link href={link.href} className="text-[#A1A1A6] text-[14px] font-medium block">
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Newsletter Card */}
          <div className="lg:col-span-4">
            <div className="relative p-[1px] rounded-[24px] overflow-hidden group">
              {/* Gradient Border Animation */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-indigo-500/20 to-white/10 group-hover:from-indigo-500/40 group-hover:via-purple-500/40 group-hover:to-indigo-500/40 transition-all duration-700" />

              <div className="relative bg-[#0A0A0B] rounded-[23px] p-7 h-full">
                <h4 className="text-lg font-bold mb-2 text-white">{t('footer.newsUpdate')}</h4>
                <p className="text-[#A1A1A6] text-[13px] mb-6 leading-relaxed">
                  {t('footer.newsletterDisclaimer')}
                </p>

                <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                    <input
                      type="email"
                      placeholder={t('hero.emailPlaceholder')}
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                  <button className="w-full bg-[#00f0ff] text-[#0F111A]   px-6 py-3.5 rounded-xl transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-[0.98]">
                    {t('footer.subscribe')}
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        {/* <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-[#A1A1A6] text-sm font-medium tracking-tight">
              © {new Date().getFullYear()} ISOBRain.ai
            </p>
            <div className="flex gap-6">
              {footerLinks[2].links.map((link) => (
                <Link key={link.label} href={link.href} className="text-[#A1A1A6]  transition-colors text-[11px] font-bold uppercase tracking-wider">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[#A1A1A6] text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-full">
              <Globe size={12} className="text-indigo-500" />
              EN-US
            </div>
          </div>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;
