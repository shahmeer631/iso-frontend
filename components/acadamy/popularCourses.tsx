"use client";

import React, { FC, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, PlayCircle, BookOpen, ShieldCheck } from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "@/lib/redux/features/auth/authSlice";
import { useGetCoursesQuery } from "@/lib/redux/api/courseApi";
import { useCheckEnrollmentMutation } from "@/lib/redux/features/auth/authApi";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

const TopPopularCourses: FC = () => {
  const { t } = useTranslation();
  const CATEGORIES = [
    "All",
    "Quality",
    "Security",
    "Environmental",
    "Health"
  ];

  const CATEGORY_LABELS: Record<string, string> = {
    "All": t('academy.all'),
    "Quality": t('academy.quality'),
    "Security": t('academy.security'),
    "Environmental": t('academy.environmental'),
    "Health": t('academy.health')
  };
  const { lang } = useParams() as { lang: string };
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 12;

  const { data: popularCourses, isLoading, isError } = useGetCoursesQuery({ limit: 100 });

  const categoryCourses = React.useMemo(() => {
    if (!popularCourses) return [];

    const representativeCourses: any[] = [];
    const seenCategories = new Set<string>();

    popularCourses.forEach((course: any) => {
      const categoryId = course.category?.id;
      if (categoryId && !seenCategories.has(categoryId)) {
        seenCategories.add(categoryId);
        representativeCourses.push({
          ...course,
          _mappedCategory: course.category?.name
        });
      }
    });

    return representativeCourses;
  }, [popularCourses]);

  const totalPages = Math.ceil(categoryCourses.length / categoriesPerPage);
  const paginatedCategories = React.useMemo(() => {
    const startIndex = (currentPage - 1) * categoriesPerPage;
    return categoryCourses.slice(startIndex, startIndex + categoriesPerPage);
  }, [categoryCourses, currentPage]);

  const handleCategoryClick = (e: React.MouseEvent<HTMLDivElement>, categorySlug: string) => {
    e.preventDefault();
    router.push(`/${lang}/academy/category/${categorySlug}`);
  };

  return (
    <section style={{ background: "#0B0F19", padding: "80px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>



        {isLoading && (
          <div style={{ color: "#00F0FF", textAlign: "center", padding: "40px 0" }}>{t('academy.loadingCourses')}</div>
        )}

        {isError && (
          <div style={{ color: "#EF4444", textAlign: "center", padding: "40px 0" }}>{t('academy.failedLoad')}</div>
        )}

        {!isLoading && !isError && (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
              gap: 32
            }}>
              <AnimatePresence mode="popLayout">
                {paginatedCategories.map((course: any) => {

                  return (
                    <motion.div
                      key={course.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover="hover"
                      onClick={(e) => handleCategoryClick(e, course.category?.slug || course._mappedCategory?.toLowerCase())}
                      style={{
                        background: "#161A22", borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)",
                        overflow: "hidden", position: "relative", display: "flex", flexDirection: "column",
                        cursor: "pointer"
                      }}
                    >
                      {/* Hover Glow Effect */}
                      <motion.div
                        variants={{ hover: { opacity: 1 } }}
                        initial={{ opacity: 0 }}
                        style={{
                          position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%, rgba(0,240,255,0.1), transparent 70%)",
                          pointerEvents: "none", zIndex: 0
                        }}
                      />

                      {/* Image / Abstract Top Section */}
                      <div style={{
                        height: 180, display: "flex", alignItems: "center", justifyContent: "center",
                        background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)",
                        position: "relative", zIndex: 1, overflow: "hidden"
                      }}>
                        {course?.thumbnail?.trim() ? (
                          <>
                            <Image
                              src={course.thumbnail}
                              alt={course.title || "Course thumbnail"}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              style={{ objectFit: "cover", opacity: 0.8 }}
                            />
                            {/* Dark overlay to ensure text/badges stay readable */}
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 0%, rgba(22, 26, 34, 1) 100%)" }} />
                          </>
                        ) : (
                          <div style={{
                            width: 80, height: 80, borderRadius: 24, background: "rgba(30,41,59,0.8)",
                            border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
                          }}>
                            <ShieldCheck size={40} color="#00F0FF" />
                          </div>
                        )}

                      </div>

                      {/* Content Section */}
                      <div style={{ padding: 24, display: "flex", flexDirection: "column", flex: 1, zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.02)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                          <span style={{ color: "#00F0FF", fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {CATEGORY_LABELS[course._mappedCategory] || course._mappedCategory}
                          </span>
                        </div>
                        <h3 className="font-inter" style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 600, marginBottom: 16, lineHeight: 1.3 }}>
                          {course.title}
                        </h3>

                        {/* Meta Tags */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                          <span className="font-inter" style={{ background: "rgba(255,255,255,0.05)", color: "#A0AAB2", fontSize: 12, padding: "4px 10px", borderRadius: 6 }}>
                            {t('academy.proLevel')}
                          </span>
                          <span className="font-inter" style={{ background: "rgba(255,255,255,0.05)", color: "#A0AAB2", fontSize: 12, padding: "4px 10px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6 }}>
                            <Clock size={12} /> {course._count?.lessons || 12} {t('academy.modules')}
                          </span>
                          <span className="font-inter" style={{ background: "rgba(0,240,255,0.1)", color: "#00F0FF", fontSize: 12, padding: "4px 10px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6 }}>
                            {t('academy.aiAssisted')}
                          </span>
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: 24 }}>
                          <p style={{ color: "#A0AAB2", fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                            {course.description || "Master the requirements and implementation strategies for this ISO standard with our interactive AI tutor."}
                          </p>
                        </div>

                        {/* CTA Button */}
                        {/* <div style={{ marginTop: "auto" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/${lang}/academy/${course.id}`);
                            }}
                            style={{
                              width: "100%", padding: "14px 20px", borderRadius: 12, fontSize: 15, fontWeight: 700,
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer",
                              background: "rgba(255,255,255,0.05)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.1)",
                              transition: "all 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                            onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                          >
                            {t('academy.viewCourse') || "View Course"} <PlayCircle size={16} />
                          </button>
                        </div> */}

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ 
                display: "flex", justifyContent: "center", alignItems: "center", 
                gap: 12, marginTop: 64, flexWrap: "wrap", paddingBottom: 64
              }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: currentPage === 1 ? "rgba(255,255,255,0.2)" : "#D4AF37",
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: "8px 16px", borderRadius: 8, cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    fontSize: 14, fontWeight: 600, transition: "all 0.2s"
                  }}
                >
                  {t('library.prev') || "Prev"}
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: currentPage === i + 1 ? "#D4AF37" : "rgba(255,255,255,0.05)",
                      color: currentPage === i + 1 ? "#0B0F19" : "#FFFFFF",
                      border: `1px solid ${currentPage === i + 1 ? "#D4AF37" : "rgba(255,255,255,0.1)"}`,
                      cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.2s"
                    }}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: currentPage === totalPages ? "rgba(255,255,255,0.2)" : "#D4AF37",
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: "8px 16px", borderRadius: 8, cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    fontSize: 14, fontWeight: 600, transition: "all 0.2s"
                  }}
                >
                  {t('library.next') || "Next"}
                </button>
              </div>
            )}

          </>
        )}

      </div>
    </section>
  );
};

export default TopPopularCourses;