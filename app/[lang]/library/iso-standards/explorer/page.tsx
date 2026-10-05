"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Standards from "@/components/Library/iso-standards/Standards";
import { Search, Command, X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import "@/lib/i18n/client";

const ExplorerContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isBarFocused, setIsBarFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, i18n } = useTranslation();
  const params = useParams();
  const lang = params?.lang as string || "en";

  // Debounce: only update searchTerm after 350ms idle
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(inputValue.trim()), 350);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Ctrl+K / Cmd+K shortcut
  const handleKeydown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      inputRef.current?.focus();
    }
    if (e.key === "Escape") inputRef.current?.blur();
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [handleKeydown]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-inter selection:bg-brand-cyan text-[#0F111A]/30 pb-20">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link 
              href={`/${lang}/library/iso-standards`}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t('library.heading')}</h1>
              <p className="text-[#64748B] text-sm">{t('library.description')}</p>
            </div>
          </div>

          {/* ── Search Bar ── */}
          <div className="relative w-full md:w-[400px]">
            <div className={`
              group flex items-center gap-3 bg-white/5 border backdrop-blur-xl rounded-xl px-4 h-12 transition-all duration-300
              ${isBarFocused ? 'border-brand-cyan ring-2 ring-brand-cyan/10 shadow-[0_0_20px_-10px_#00F0FF44]' : 'border-white/10 hover:border-white/20'}
            `}>
              <Search className={`w-4 h-4 transition-colors duration-300 ${isBarFocused ? 'text-brand-cyan' : 'text-[#64748B]'}`} />
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setIsBarFocused(true)}
                onBlur={() => setIsBarFocused(false)}
                placeholder={t('library.searchPlaceholder')}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-[#475569] text-sm"
              />
              <div className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#64748B] text-[10px] font-bold uppercase">
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="mt-12">
        <Standards searchTerm={searchTerm} />
      </main>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-cyan/20 border-t-[#00F0FF] rounded-full animate-spin" />
      </div>
    }>
      <ExplorerContent />
    </Suspense>
  );
};

export default Page;
