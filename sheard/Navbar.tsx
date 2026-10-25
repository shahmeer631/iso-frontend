"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LanguaseComponent from "@/components/LanguaseComponent";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { selectCurrentToken, logOut } from "@/lib/redux/features/auth/authSlice";
import { useTranslation } from "react-i18next";
import { useGetCoursesQuery } from "@/lib/redux/api/courseApi";
import { useGetCategoriesQuery } from "@/lib/redux/api/isoStandardsApi";
import { DASHBOARD_BASE_URL } from "@/lib/config/dashboard";
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
      { label: t("nav.academySub.all") || "All Courses", href: "/academy" },
    ];

    if (popularCourses) {
      const seenCategories = new Set<string>();
      popularCourses.forEach((course: { category?: { id?: string; name?: string; slug?: string } }) => {
        const category = course.category;
        if (category && category.id && !seenCategories.has(category.id)) {
          seenCategories.add(category.id);
          items.push({
            label: category.name || "",
            href: `/academy/category/${category.slug}`,
          });
        }
      });
    } else {
      items.push(
        {
          label: t("nav.academySub.quality") || "Quality",
          href: "/academy/category/quality-management-systems",
        },
        {
          label: t("nav.academySub.security") || "Security",
          href: "/academy/category/information-security-management-systems",
        },
        {
          label: t("nav.academySub.environmental") || "Environmental",
          href: "/academy/category/environmental-management-systems",
        },
        {
          label: t("nav.academySub.health") || "Health",
          href: "/academy/category/occupational-health-and-safety",
        }
      );
    }
    return items;
  }, [popularCourses, t]);

  const librarySubItems = useMemo(() => {
    const items: NavSubItem[] = [
      {
        label: t("nav.librarySub.all") || "All Standards",
        href: "/library/iso-standards",
      },
    ];

    if (libraryCategories?.data) {
      libraryCategories.data.forEach((cat) => {
        items.push({
          label: cat.name,
          href: `/library/iso-standards/category/${cat.id}`,
        });
      });
    } else {
      items.push(
        {
          label: "Quality Management Systems",
          href: "/library/iso-standards?category=Quality Management Systems",
        },
        {
          label: "Information Security Management Systems",
          href: "/library/iso-standards?category=Information Security Management Systems",
        },
        {
          label: "Environmental Management Systems",
          href: "/library/iso-standards?category=Environmental Management Systems",
        }
      );
    }
    return items;
  }, [libraryCategories, t]);

  const navigation: NavItem[] = [
    { label: t("nav.library"), subItems: librarySubItems },
    { label: t("nav.academy"), subItems: categorySubItems },
    {
      label: t("nav.aiAssistant"),
      subItems: [
        { label: t("nav.aiAssistantSub.home"), href: "/ai-assistant-home" },
        {
          label: t("nav.aiAssistantSub.navigator"),
          href: "/ai-assistant/iso-navigator",
        },
        {
          label: t("nav.aiAssistantSub.auditLens"),
          href: "/ai-assistant/audit-lens",
        },
        {
          label: t("nav.aiAssistantSub.benchmark"),
          href: "/ai-assistant/benchmark-ai",
        },
      ],
    },
    { label: t("nav.masteryLab"), href: "/mastery-lab" },
    { label: t("nav.pricing"), href: "/pricing" },
  ];

  const isAuthenticated =
    !!token ||
    (isClient &&
      typeof document !== "undefined" &&
      !!document.cookie.match(/(^| )token=([^;]+)/));

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const handleLogout = () => {
    dispatch(logOut());
    document.cookie =
      "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
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

  const activeNavItem = navigation.find((n) => n.label === activeDropdown);
  const megaHint =
    activeDropdown === t("nav.academy")
      ? "Explore Courses →"
      : activeDropdown === t("nav.library")
        ? "Explore Standards →"
        : "Try Tool →";

  return (
    <nav className="relative sticky top-0 z-[100] border-b border-[var(--ib-line)] bg-[color-mix(in_srgb,var(--ib-bg)_90%,transparent)] backdrop-blur-[12px]">
      <div className="ib-w flex h-[66px] items-center gap-9">
        <Link
          href={`/${lang}/`}
          onClick={() => setIsOpen(false)}
          className="flex shrink-0 items-center gap-[9px] text-[18px] font-bold tracking-[-0.02em] text-[var(--ib-ink)]"
        >
          <span className="relative size-[26px] shrink-0 overflow-hidden rounded-[7px]">
            <Image
              src="/Icon.png"
              alt="ISOBrain"
              width={26}
              height={26}
              className="object-contain"
              priority
            />
          </span>
          ISOBrain.AI
        </Link>

        {/* Desktop menu triggers */}
        <div className="hidden min-[901px]:flex flex-1 items-center gap-[26px] text-sm font-medium text-[var(--ib-mute)]">
          {navigation.map((item) => (
            <div
              key={item.label}
              onMouseEnter={() =>
                item.subItems && handleMouseEnter(item.label)
              }
              onMouseLeave={handleMouseLeave}
            >
              {item.subItems ? (
                <button
                  type="button"
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === item.label ? null : item.label
                    )
                  }
                  className={`inline-flex items-center gap-1 transition-colors ${
                    activeDropdown === item.label
                      ? "text-[var(--ib-ink)]"
                      : "hover:text-[var(--ib-ink)]"
                  }`}
                >
                  {item.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      activeDropdown === item.label ? "rotate-180" : ""
                    }`}
                  />
                </button>
              ) : (
                <Link
                  href={`/${lang}${item.href!}`}
                  className="hover:text-[var(--ib-ink)] transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden min-[901px]:flex items-center gap-4">
          <LanguaseComponent />
          {!isClient ? (
            <div className="min-w-[140px]" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href={DASHBOARD_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="ib-btn ib-btn-s"
              >
                {t("nav.dashboard")}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="grid size-9 place-items-center rounded-[10px] border border-[var(--ib-line)] text-[var(--ib-mute)] hover:bg-[var(--ib-accbg)] hover:text-[var(--ib-acc)]"
                title={t("nav.logout")}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href={`/${lang}/auth/login`}
                className="text-sm font-medium text-[var(--ib-mute)] hover:text-[var(--ib-ink)]"
              >
                {lang === "en" ? "Log in" : t("nav.login")}
              </Link>
              <Link href={`/${lang}/auth/sign-up`} className="ib-btn ib-btn-s">
                {lang === "en" ? "Get started" : t("nav.signUp") || "Get started"}
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          className="ml-auto min-[901px]:hidden grid size-10 place-items-center rounded-[10px] text-[var(--ib-ink)]"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop mega menu — full-width rectangular panel */}
      <AnimatePresence>
        {activeDropdown && activeNavItem?.subItems && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
            className="absolute left-0 right-0 top-full z-[110] hidden border-b border-[var(--ib-line)] bg-[var(--ib-card)] shadow-[0_24px_60px_-24px_rgba(11,18,32,0.25)] min-[901px]:block"
          >
            <div className="ib-w py-7">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-10">
                <div className="border-[var(--ib-line)] lg:col-span-1 lg:border-r lg:pr-8">
                  <h3 className="mb-2 text-[22px] font-bold tracking-tight text-[var(--ib-ink)]">
                    {activeDropdown}
                  </h3>
                  <div className="mb-4 h-1 w-10 rounded-full bg-[var(--ib-acc)]" />
                  <p className="max-w-xs text-[13px] leading-relaxed text-[var(--ib-mute)]">
                    Explore our comprehensive resources and specialized tools
                    designed for ISO professionals worldwide.
                  </p>
                </div>

                <div className="lg:col-span-3">
                  <div className="grid max-h-[min(70vh,520px)] grid-cols-1 gap-1 overflow-y-auto custom-thin-scrollbar sm:grid-cols-2 lg:grid-cols-3">
                    {activeNavItem.subItems.map((sub) => (
                      <Link
                        key={sub.label}
                        href={`/${lang}${sub.href}`}
                        onClick={() => setActiveDropdown(null)}
                        className="group relative flex flex-col overflow-hidden rounded-[10px] border border-transparent px-3 py-2.5 transition-all hover:border-[var(--ib-line)] hover:bg-[var(--ib-accbg)]"
                      >
                        <span className="relative z-10 text-[13px] font-medium leading-snug text-[var(--ib-ink)] transition-colors group-hover:text-[var(--ib-acc)]">
                          {sub.label}
                        </span>
                        <span className="relative z-10 mt-0.5 hidden text-[10px] text-[var(--ib-mute)] opacity-0 transition-all group-hover:block group-hover:opacity-100">
                          {megaHint}
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

      {/* Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="min-[901px]:hidden border-t border-[var(--ib-line)] bg-[var(--ib-card)] overflow-hidden"
          >
            <div className="ib-w flex flex-col gap-1 py-4 pb-8 max-h-[calc(100vh-66px)] overflow-y-auto">
              {navigation.map((item) => (
                <div
                  key={item.label}
                  className="border-b border-[var(--ib-line)] py-3"
                >
                  {item.subItems ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setMobileExpanded(
                            mobileExpanded === item.label ? null : item.label
                          )
                        }
                        className="flex w-full items-center justify-between text-[16px] font-semibold text-[var(--ib-ink)]"
                      >
                        {item.label}
                        <ChevronDown
                          size={18}
                          className={`text-[var(--ib-mute)] transition-transform ${
                            mobileExpanded === item.label ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {mobileExpanded === item.label && (
                        <div className="mt-2 space-y-1 pl-3 border-l-2 border-[var(--ib-accbg)]">
                          {item.subItems.map((sub) => (
                            <Link
                              key={sub.label}
                              href={`/${lang}${sub.href}`}
                              onClick={() => setIsOpen(false)}
                              className="block py-2 text-sm text-[var(--ib-mute)] hover:text-[var(--ib-acc)]"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={`/${lang}${item.href!}`}
                      onClick={() => setIsOpen(false)}
                      className="block text-[16px] font-semibold text-[var(--ib-ink)]"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}

              <div className="pt-6 space-y-3">
                {!isClient ? null : !isAuthenticated ? (
                  <>
                    <Link
                      href={`/${lang}/auth/login`}
                      onClick={() => setIsOpen(false)}
                      className="ib-btn ib-btn-o w-full justify-center"
                    >
                      {lang === "en" ? "Log in" : t("nav.login")}
                    </Link>
                    <Link
                      href={`/${lang}/auth/sign-up`}
                      onClick={() => setIsOpen(false)}
                      className="ib-btn w-full justify-center"
                    >
                      {lang === "en" ? "Get started" : t("nav.signUp") || "Get started"}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={DASHBOARD_BASE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                      className="ib-btn w-full justify-center"
                    >
                      {t("nav.dashboard")}
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="ib-btn ib-btn-o w-full justify-center text-red-600 border-red-200"
                    >
                      <LogOut size={18} />
                      {t("nav.logout")}
                    </button>
                  </>
                )}
                <div className="flex justify-center pt-2">
                  <LanguaseComponent />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
