/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Loader2, Sparkles, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGetCategoriesQuery, useGetISOStandardsQuery } from "@/lib/redux/api/isoStandardsApi";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

// ── Category accent colors (dark-theme variants) ──────────────────────────
const CATEGORY_COLORS: { dot: string; badge: string; badgeText: string }[] = [
  { dot: "#3B82F6", badge: "rgba(59,130,246,0.12)", badgeText: "#60A5FA" },
  { dot: "#10B981", badge: "rgba(16,185,129,0.12)", badgeText: "#34D399" },
  { dot: "#EC4899", badge: "rgba(236,72,153,0.12)", badgeText: "#F472B6" },
  { dot: "#F97316", badge: "rgba(249,115,22,0.12)", badgeText: "#FB923C" },
  { dot: "#8B5CF6", badge: "rgba(139,92,246,0.12)", badgeText: "#A78BFA" },
  { dot: "#EF4444", badge: "rgba(239,68,68,0.12)", badgeText: "#F87171" },
  { dot: "#14B8A6", badge: "rgba(20,184,166,0.12)", badgeText: "#2DD4BF" },
  { dot: "#FBBF24", badge: "rgba(251,191,36,0.12)", badgeText: "#FCD34D" },
  { dot: "#06B6D4", badge: "rgba(6,182,212,0.12)", badgeText: "#22D3EE" },
  { dot: "#D4AF37", badge: "rgba(0,240,255,0.12)", badgeText: "#D4AF37" },
];

// ── Standard Card ─────────────────────────────────────────────────────────
const StandardCard = ({
  item,
  color,
  onOpenChat,
  isPreviewMode,
  onSeeAll,
}: {
  item: any;
  color: { dot: string; badge: string; badgeText: string };
  onOpenChat: (id: string) => void;
  isPreviewMode?: boolean;
  onSeeAll?: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        background: "#161A22",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        cursor: "default",
        transition: "border-color 0.2s",
        height: "100%",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${color.dot}40`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
      }}
    >
      {/* Category badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "3px 10px", borderRadius: 99,
          background: color.badge, color: color.badgeText,
          fontSize: 11, fontWeight: 500, letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: color.dot, flexShrink: 0 }} />
          {item.category?.name || "Standard"}
        </span>

        {item.code && (
          <span style={{ fontSize: 11, color: "#475569", fontWeight: 500, fontFamily: "'Space Grotesk', sans-serif" }}>
            {item.code}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 style={{
        color: "#CBD5E1", fontSize: 15, fontWeight: 500, lineHeight: 1.5,
        flex: 1, margin: 0,
      }}>
        {item.title}
      </h3>

      {/* Summary preview */}
      {item.summary && (
        <p style={{
          color: "#475569", fontSize: 13, lineHeight: 1.6,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
          margin: 0,
        }}>
          {item.summary}
        </p>
      )}

      {/* CTA */}
      {isPreviewMode ? (
        <button
          type="button"
          onClick={onSeeAll}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            width: "100%", padding: "11px 16px",
            background: "rgba(63,62,237,0.15)",
            border: "1px solid rgba(63,62,237,0.3)",
            borderRadius: 10, color: "#818CF8",
            fontSize: 13, fontWeight: 500, cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.2s ease",
            marginTop: "auto",
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = "#00F0FF";
            btn.style.borderColor = "#00F0FF";
            btn.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = "rgba(63,62,237,0.15)";
            btn.style.borderColor = "rgba(63,62,237,0.3)";
            btn.style.color = "#818CF8";
          }}
        >
          <LayoutGrid size={14} style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {t('library.viewAll')} {item.category?.name || "Category"}
          </span>
          <ArrowRight size={14} style={{ flexShrink: 0 }} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onOpenChat(item.id)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            width: "100%", padding: "11px 16px",
            background: "rgba(63,62,237,0.15)",
            border: "1px solid rgba(63,62,237,0.3)",
            borderRadius: 10, color: "#818CF8",
            fontSize: 13, fontWeight: 500, cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.2s ease",
            marginTop: "auto",
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = "#00F0FF";
            btn.style.borderColor = "#00F0FF";
            btn.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.background = "rgba(63,62,237,0.15)";
            btn.style.borderColor = "rgba(63,62,237,0.3)";
            btn.style.color = "#818CF8";
          }}
        >
          <Sparkles size={14} />
          {t('library.chatWithAi')}
          <ArrowRight size={14} />
        </button>
      )}
    </motion.div >
  );
};

const CategoryPreviewItem = ({ category, color, onOpenChat, onSeeAll }: any) => {
  const { data, isLoading } = useGetISOStandardsQuery({ categoryId: category.id, limit: 1 });
  const item = data?.data?.[0];

  if (isLoading) {
    return (
      <div style={{ height: 250, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }} />
    );
  }

  if (!item) return null;

  return (
    <motion.div layout style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
      <StandardCard
        item={item}
        color={color}
        onOpenChat={onOpenChat}
        isPreviewMode={true}
        onSeeAll={onSeeAll}
      />
    </motion.div>
  );
};


// ── Main Standards Component ──────────────────────────────────────────────
interface StandardsProps {
  searchTerm?: string;
  selectedCategoryId?: string;
}

const Standards = ({ searchTerm = "", selectedCategoryId }: StandardsProps) => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || "all";

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activePage, setActivePage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";
  const PAGE_LIMIT = 12;

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setActivePage(1);
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [searchTerm]);

  React.useEffect(() => { setActivePage(1); }, [activeCategory]);

  // Sync with external categoryId selection
  React.useEffect(() => {
    if (selectedCategoryId) {
      setActiveCategory(selectedCategoryId);
      // Scroll to standards section smoothly
      const element = document.getElementById("standards-explorer");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [selectedCategoryId]);

  const { data: categoriesData, isLoading: isCatLoading } = useGetCategoriesQuery();
  const { data: standardsData, isLoading: isStdLoading } = useGetISOStandardsQuery({
    page: activePage,
    limit: PAGE_LIMIT,
    search: debouncedSearch || undefined,
    categoryId: activeCategory === "all" ? undefined : activeCategory,
  });

  const categories = categoriesData?.data || [];
  const allStandards = standardsData?.data || [];
  const totalItems = standardsData?.meta?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_LIMIT));

  const categoryColorMap = React.useMemo(() => {
    const map: Record<string, { dot: string; badge: string; badgeText: string }> = {};
    categories.forEach((cat: any, i: number) => {
      map[cat.id] = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
    });
    return map;
  }, [categories]);

  const handleOpenChat = (standardId: string) => {
    router.push(`/${lang}/library/iso-standards/chat/${standardId}`);
  };

  const handleCategorySelect = (categoryId: string, categoryName: string) => {
    setActiveCategory(categoryId);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('category', categoryName);
    // lang and platform/iso-standards are part of the path, so we just update the query
    router.push(`?${newParams.toString()}`, { scroll: false });
  };

  // Resolve category name from URL to ID
  React.useEffect(() => {
    const categoryNameInUrl = searchParams.get('category');
    if (categoryNameInUrl && categories.length > 0) {
      if (categoryNameInUrl === "all") {
        setActiveCategory("all");
      } else {
        const found = categories.find((c: any) => c.name === categoryNameInUrl);
        if (found) {
          setActiveCategory(found.id);
        }
      }
    }
  }, [searchParams, categories]);

  const isPreviewMode = activeCategory === "all" && !debouncedSearch;

  return (
    <section id="standards-explorer" style={{ background: "#0E1116", padding: "80px 16px 80px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* ── Section Header ── */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 className="space-grotesk" style={{ fontSize: "clamp(24px, 5vw, 40px)", fontWeight: 500, color: "#FFFFFF", marginBottom: 16 }}>
            {t('library.head')}
          </h2>
          <div style={{ width: 80, height: 3, background: "linear-gradient(90deg, #00F0FF, #D4AF37)", margin: "0 auto", borderRadius: 99 }} />
        </div>

        {/* ── Category Filter Tabs ── */}
        {/* ... (commented out) ... */}

        {/* ── Loading ── */}
        {isStdLoading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <Loader2 size={36} color="#00F0FF" style={{ animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── Empty state ── */}
        {!isStdLoading && !isPreviewMode && allStandards.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 16 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 16,
              background: "rgba(63,62,237,0.1)", border: "1px solid rgba(63,62,237,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <LayoutGrid size={28} color="#00F0FF" />
            </div>
            <p style={{ color: "#E2E8F0", fontSize: 16, fontWeight: 500, margin: 0 }}>{t('library.noStandards')}</p>
            <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>{t('library.tryDifferent')}</p>
            <button
              onClick={() => handleCategorySelect("all", "all")}
              style={{
                marginTop: 8, padding: "9px 20px", borderRadius: 99,
                background: "#00F0FF", border: "none", color: "#fff",
                fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {t('library.showAll')}
            </button>
          </div>
        )}

        {/* ── Grid ── */}
        {!isStdLoading && isPreviewMode && categories.length > 0 && (
          <motion.div
            layout
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 380px), 1fr))", gap: 16 }}
          >
            <AnimatePresence mode="popLayout">
              {categories.map((cat: any) => (
                <CategoryPreviewItem
                  key={cat.id}
                  category={cat}
                  color={categoryColorMap[cat.id] || CATEGORY_COLORS[0]}
                  onOpenChat={handleOpenChat}
                  onSeeAll={() => handleCategorySelect(cat.id, cat.name)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!isStdLoading && !isPreviewMode && (
          <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => handleCategorySelect("all", "all")}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 16px", borderRadius: 10,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#94A3B8", fontSize: 13, fontWeight: 500, cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = "rgba(255,255,255,0.1)";
                b.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = "rgba(255,255,255,0.05)";
                b.style.color = "#94A3B8";
              }}
            >
              <ChevronLeft size={16} />
              {t('library.backToCategories')}
            </button>
            <h3 style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 500, margin: 0 }}>
              {categories.find((c: any) => c.id === activeCategory)?.name || t('library.standard')}
            </h3>
          </div>
        )}

        {!isStdLoading && !isPreviewMode && allStandards.length > 0 && (
          <>
            <motion.div
              layout
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 380px), 1fr))", gap: 16 }}
            >
              <AnimatePresence mode="popLayout">
                {allStandards.map((item: any) => (
                  <StandardCard
                    key={item.id}
                    item={item}
                    color={categoryColorMap[item.categoryId] || CATEGORY_COLORS[0]}
                    onOpenChat={handleOpenChat}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div style={{
                display: "flex", justifyContent: "center", alignItems: "center",
                gap: 8, marginTop: 48,
              }}>
                <button
                  onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                  disabled={activePage === 1}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "8px 14px", borderRadius: 10,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    color: activePage === 1 ? "#334155" : "#94A3B8",
                    fontSize: 13, fontWeight: 500, cursor: activePage === 1 ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <ChevronLeft size={15} /> {t('library.prev')}
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  const isActive = activePage === page;
                  return (
                    <button
                      key={page}
                      onClick={() => setActivePage(page)}
                      style={{
                        width: 36, height: 36, borderRadius: 8, fontSize: 13, fontWeight: 500,
                        background: isActive ? "#00F0FF" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${isActive ? "#00F0FF" : "rgba(255,255,255,0.08)"}`,
                        color: isActive ? "#fff" : "#64748B",
                        cursor: "pointer", fontFamily: "inherit",
                        boxShadow: isActive ? "0 4px 16px rgba(63,62,237,0.3)" : "none",
                      }}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setActivePage((p) => Math.min(totalPages, p + 1))}
                  disabled={activePage === totalPages}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "8px 14px", borderRadius: 10,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    color: activePage === totalPages ? "#334155" : "#94A3B8",
                    fontSize: 13, fontWeight: 500, cursor: activePage === totalPages ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {t('library.next')} <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Standards;
