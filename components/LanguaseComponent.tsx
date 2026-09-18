"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname, useParams } from "next/navigation";
import i18n from "@/lib/i18n/client";

const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
  { code: "ar", label: "العربية" },
];

const SUPPORTED_LOCALES = ["en", "fr", "es", "it", "ar"];

const LanguaseComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const getActiveLang = () => {
    const urlLocale = params?.lang as string;
    if (SUPPORTED_LOCALES.includes(urlLocale)) return urlLocale;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("preferredLanguage");
      if (saved && SUPPORTED_LOCALES.includes(saved)) return saved;
    }
    return "en";
  };

  const [currentLang, setCurrentLang] = useState<string>(getActiveLang);

  // Sync when URL changes (e.g. browser back/forward)
  useEffect(() => {
    const lang = getActiveLang();
    setCurrentLang(lang);
  }, [params?.lang]);

  const changeLanguage = (newLang: string) => {
    if (newLang === currentLang) {
      setIsOpen(false);
      return;
    }

    // 1. Update i18next instantly — no reload needed
    i18n.changeLanguage(newLang);

    // 2. Set RTL for Arabic
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;

    // 3. Persist preference
    localStorage.setItem("preferredLanguage", newLang);
    setCurrentLang(newLang);
    setIsOpen(false);

    // 4. Update URL path (soft navigation — no full reload)
    const segments = pathname.split("/");
    if (SUPPORTED_LOCALES.includes(segments[1])) {
      segments[1] = newLang;
    } else {
      segments.splice(1, 0, newLang);
    }
    const newPath = segments.join("/") || "/";
    router.push(newPath);
  };

  // Click outside to close
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
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all group"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe size={18} className="text-[#A1A1A6] group-hover:text-white transition-colors" />
        <span className="text-sm font-bold text-[#A1A1A6] group-hover:text-white transition-colors uppercase">
          {currentLang}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 bottom-full mb-3 lg:top-full lg:bottom-auto lg:mt-3 w-44 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl z-[1000] overflow-hidden"
          >
            <div className="flex flex-col p-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`px-4 py-2 text-sm font-medium text-left rounded-xl transition-colors ${currentLang === lang.code
                    ? "bg-brand-cyan text-[#0F111A] text-white"
                    : "text-[#A1A1A6] hover:text-white hover:bg-white/5"
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
