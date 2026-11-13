"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname, useParams } from "next/navigation";
import i18n from "@/lib/i18n/client";
import {
  DEFAULT_LOCALE,
  isAppLocale,
  isRtlLocale,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  type AppLocale,
} from "@/lib/i18n/locales";

const languages = SUPPORTED_LOCALES.map((code) => ({
  code,
  label: LOCALE_LABELS[code],
}));

const LanguaseComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const getActiveLang = (): AppLocale => {
    const urlLocale = params?.lang as string;
    if (isAppLocale(urlLocale)) return urlLocale;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("preferredLanguage");
      if (isAppLocale(saved)) return saved;
    }
    return DEFAULT_LOCALE;
  };

  const [currentLang, setCurrentLang] = useState<AppLocale>(getActiveLang);

  useEffect(() => {
    setCurrentLang(getActiveLang());
  }, [params?.lang]);

  const changeLanguage = (newLang: AppLocale) => {
    if (newLang === currentLang) {
      setIsOpen(false);
      return;
    }

    i18n.changeLanguage(newLang);
    document.documentElement.dir = isRtlLocale(newLang) ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
    document.documentElement.setAttribute("data-locale", newLang);
    localStorage.setItem("preferredLanguage", newLang);
    setCurrentLang(newLang);
    setIsOpen(false);

    const segments = pathname.split("/");
    if (isAppLocale(segments[1])) {
      segments[1] = newLang;
    } else {
      segments.splice(1, 0, newLang);
    }
    router.push(segments.join("/") || `/${newLang}`);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-[10px] px-3 py-2 transition-all hover:bg-[var(--ib-accbg)] group"
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe
          size={18}
          className="text-[var(--ib-mute)] transition-colors group-hover:text-[var(--ib-acc)]"
        />
        <span className="text-sm font-semibold uppercase text-[var(--ib-mute)] transition-colors group-hover:text-[var(--ib-ink)]">
          {currentLang}
        </span>
        <ChevronDown
          size={14}
          className={`text-[var(--ib-mute)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="listbox"
            aria-label="Languages"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute end-0 bottom-full z-[1000] mb-3 w-44 overflow-hidden rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)] shadow-[0_16px_40px_-20px_rgba(11,18,32,0.35)] lg:top-full lg:bottom-auto lg:mt-3"
          >
            <div className="flex flex-col p-1.5">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={currentLang === lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`rounded-[10px] px-4 py-2.5 text-start text-sm font-medium transition-colors ${
                    currentLang === lang.code
                      ? "bg-[var(--ib-accbg)] text-[var(--ib-acc)]"
                      : "text-[var(--ib-ink)] hover:bg-[var(--ib-bg)] hover:text-[var(--ib-acc)]"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguaseComponent;
