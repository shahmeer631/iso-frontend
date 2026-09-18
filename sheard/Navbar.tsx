"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, Globe, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import LanguaseComponent from "@/components/LanguaseComponent";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { selectCurrentToken, logOut } from "@/lib/redux/features/auth/authSlice";
import { useTranslation } from "react-i18next";
import { useGetCoursesQuery } from "@/lib/redux/api/courseApi";
import { useGetCategoriesQuery } from "@/lib/redux/api/isoStandardsApi";
import "@/lib/i18n/client";

interface NavSubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  subItems?: NavSubItem[];
  requiresAuth?: boolean;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const { t } = useTranslation();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const token = useSelector(selectCurrentToken);
  const dispatch = useDispatch();
  const router = useRouter();

  const { data: popularCourses } = useGetCoursesQuery({ limit: 100 });
  const { data: libraryCategories } = useGetCategoriesQuery();

  const categorySubItems = useMemo(() => {
    const items: NavSubItem[] = [
      { label: t('nav.academySub.all') || "All Courses", href: "/academy" }
    ];

    if (popularCourses) {
      const seenCategories = new Set<string>();
      popularCourses.forEach((course: any) => {
        const category = course.category;
        if (category && category.id && !seenCategories.has(category.id)) {
          seenCategories.add(category.id);
          items.push({
            label: category.name,
            href: `/academy/category/${category.slug}`
          });
        }
      });
    } else {
      // Fallback while loading or if no data
      items.push(
        { label: t('nav.academySub.quality') || "Quality", href: "/academy/category/quality-management-systems" },
        { label: t('nav.academySub.security') || "Security", href: "/academy/category/information-security-management-systems" },
        { label: t('nav.academySub.environmental') || "Environmental", href: "/academy/category/environmental-management-systems" },
        { label: t('nav.academySub.health') || "Health", href: "/academy/category/occupational-health-and-safety" }
      );
    }
    return items;
  }, [popularCourses, t]);

  const librarySubItems = useMemo(() => {
    const items: NavSubItem[] = [
      { label: t('nav.librarySub.all') || "All Standards", href: "/library/iso-standards" }
    ];

    if (libraryCategories?.data) {
      libraryCategories.data.forEach((cat) => {
        items.push({
          label: cat.name,
          href: `/library/iso-standards/category/${cat.id}`
        });
      });
    } else {
      // Fallback
      items.push(
        { label: "Quality Management Systems", href: "/library/iso-standards?category=Quality Management Systems" },
        { label: "Information Security Management Systems", href: "/library/iso-standards?category=Information Security Management Systems" },
        { label: "Environmental Management Systems", href: "/library/iso-standards?category=Environmental Management Systems" }
      );
    }
    return items;
  }, [libraryCategories, t]);

  const navigation: NavItem[] = [

    {
      label: t('nav.library'),
      subItems: librarySubItems
    },
    {
      label: t('nav.academy'),
      subItems: categorySubItems
    },
    {
      label: t('nav.aiAssistant'),
      subItems: [
        { label: t('nav.aiAssistantSub.home'), href: "/ai-assistant-home" },
        { label: t('nav.aiAssistantSub.navigator'), href: "/ai-assistant/iso-navigator" },
        { label: t('nav.aiAssistantSub.auditLens'), href: "/ai-assistant/audit-lens" },
        { label: t('nav.aiAssistantSub.benchmark'), href: "/ai-assistant/benchmark-ai" },
      ]
    },
    { label: t('nav.masteryLab'), href: "/mastery-lab" },
    { label: t('nav.pricing'), href: "/pricing" },
    // { label: t('nav.about'), href: "/about" },
  ];

  const isAuthenticated = !!token || (isClient && typeof document !== 'undefined' && !!document.cookie.match(/(^| )token=([^;]+)/));

  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleLogout = () => {
    dispatch(logOut());
    document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push(`/${lang}/auth/login`);
    setIsOpen(false);
  };

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${isScrolled || isOpen ? "bg-[#0A0A0B]/95 backdrop-blur-xl border-b border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] py-2" : "bg-transparent py-4 border-b border-white/0"}`}>
      {/* Top Accent Line */}
      <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent transition-opacity duration-500 ${isScrolled ? "opacity-100" : "opacity-0"}`} />
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link href={`/${lang}/`} onClick={() => setIsOpen(false)} className="flex items-center gap-2 group shrink-0 relative z-[110]">
            <div className="relative w-8 h-8">
              <Image src="/Icon.png" alt={t('dynamic.dyn_icon_6')} fill className="object-contain" />
              <div className="absolute inset-0 rounded-lg bg-indigo-500/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              ISOBrain.AI
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden xl:flex items-center h-full">
            {navigation.map((item) => (
              <div
                key={item.label}
                className="h-full flex items-center px-4 relative"
                onMouseEnter={() => item.subItems && handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                {item.subItems ? (
                  <button className={`flex items-center gap-1 text-[15px] font-medium transition-colors duration-200 ${activeDropdown === item.label ? "text-white" : "text-[#A1A1A6] hover:text-white"}`}>
                    {item.label}
                    <ChevronDown size={14} className={`transition-transform duration-300 ${activeDropdown === item.label ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <Link href={`/${lang}${item.href!}`} className="text-[15px] font-medium text-[#A1A1A6] hover:text-white transition-colors duration-200">
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden xl:flex items-center gap-6">
            <div className="flex items-center gap-4 text-gray-600">
              <LanguaseComponent />
            </div>

            <div className="h-6 w-[1px] bg-white/10 mx-2" />

            {!isClient ? (
              <div className="flex items-center gap-4 min-w-[160px]"></div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-5">
                <Link
                  href="https://dashboard.isobrain.ai"
                  target="_blank"
                  className="bg-brand-cyan bg-[#00f0ff] text-[#0F111A] px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all"
                >
                  {t('nav.dashboard')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 transition-all active:scale-90"
                  title={t('nav.logout')}
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href={`/${lang}/auth/login`} className="text-[15px] font-medium text-[#A1A1A6] hover:text-white transition-colors">
                  {t('nav.login')}
                </Link>
                <Link href={`/${lang}/auth/sign-up`} className="bg-white/5 hover:bg-white/10 text-white px-7 py-3 rounded-xl font-bold text-sm border border-white/10 active:scale-95 transition-all">
                  {t('nav.signUp')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="xl:hidden text-white p-2 relative z-[110]" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Desktop Mega Menu */}
      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
            className="hidden xl:block absolute top-[64px] left-0 w-full bg-[#0A0A0B]/98 backdrop-blur-2xl border-b border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-40 pt-6 pb-8 overflow-hidden"
          >
            <div className="max-w-[1440px] mx-auto px-12">
              <div className="grid grid-cols-4 gap-12">
                <div className="col-span-1 border-r border-white/5 pr-12">
                  <h3 className="text-white font-bold text-2xl mb-3 tracking-tight">
                    {activeDropdown}
                  </h3>
                  <div className="h-1 w-10 bg-indigo-500 mb-5" />
                  <p className="text-[#A1A1A6] text-[13px] leading-relaxed max-w-xs">
                    Explore our comprehensive resources and specialized tools designed for ISO professionals worldwide.
                  </p>
                </div>

                <div className="col-span-3">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-1">
                    {navigation.find(n => n.label === activeDropdown)?.subItems?.map((sub, idx) => (
                      <Link
                        key={sub.label}
                        href={`/${lang}${sub.href}`}
                        onClick={() => setActiveDropdown(null)}
                        className="group flex flex-col py-2 px-3 hover:bg-white/[0.08] rounded-lg transition-all duration-300 relative overflow-hidden border border-white/0 hover:border-white/5"
                      >
                        <span className="text-[#D1D5DB] font-medium text-[13px] leading-snug group-hover:text-white transition-colors relative z-10">
                          {sub.label}
                        </span>
                        <span className="text-[#A1A1A6] text-[10px] hidden group-hover:block opacity-0 group-hover:opacity-100 transition-all relative z-10 mt-0.5">
                          {activeDropdown === t('nav.academy') ? "Explore Courses →" : activeDropdown === t('nav.library') ? "Explore Standards →" : "Try Tool →"}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="xl:hidden fixed inset-0 top-0 bg-[#0A0A0B] z-[105] overflow-y-auto pt-24 px-6 pb-12"
          >
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <div key={item.label} className="border-b border-white/5 py-4">
                  {item.subItems ? (
                    <>
                      <button
                        onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                        className="flex items-center justify-between w-full text-xl font-bold text-white py-2"
                      >
                        {item.label}
                        <ChevronDown size={22} className={`transition-transform duration-300 ${mobileExpanded === item.label ? "rotate-180 text-indigo-500" : "text-gray-500"}`} />
                      </button>
                      <AnimatePresence>
                        {mobileExpanded === item.label && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 pl-4 space-y-4 border-l-2 border-indigo-500/20"
                          >
                            {item.subItems.map((sub) => (
                              <Link
                                key={sub.label}
                                href={`/${lang}${sub.href}`}
                                onClick={() => setIsOpen(false)}
                                className="block text-[#A1A1A6] font-medium text-lg hover:text-white py-2"
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={`/${lang}${item.href!}`}
                      onClick={() => setIsOpen(false)}
                      className="block text-xl font-bold text-white py-2"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}

              <div className="pt-10 space-y-4">
                {!isClient ? null : !isAuthenticated ? (
                  <div className="grid grid-cols-1 gap-4">
                    <Link href={`/${lang}/auth/login`} className="w-full text-center py-4 border border-white/10 rounded-2xl font-bold text-white hover:bg-white/5 transition-colors" onClick={() => setIsOpen(false)}>
                      {t('nav.login')}
                    </Link>
                    <Link href={`/${lang}/auth/sign-up`} className="w-full text-center py-4bg-[#00f0ff] text-[#0F111A] text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20" onClick={() => setIsOpen(false)}>
                      {t('nav.signUp')}
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    <Link
                      href="https://dashboard.isobrain.ai"
                      target="_blank"
                      className="w-full text-center py-4 bg-[#00f0ff] text-[#0F111A]   rounded-2xl font-bold shadow-lg shadow-[#D4AF37]/20 transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      {t('nav.dashboard')}
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 text-red-500 rounded-2xl font-bold border border-red-500/20">
                      <LogOut size={20} />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
                <div className="flex justify-center pt-6">
                  <div className="bg-white/5 p-2 rounded-2xl border border-white/10">
                    <LanguaseComponent />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
