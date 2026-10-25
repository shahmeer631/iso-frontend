"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, PlayCircle, BookOpen, ShieldCheck, ArrowLeft, Award, Sparkles, Star, Brain } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "@/lib/redux/features/auth/authSlice";
import { useGetCoursesQuery } from "@/lib/redux/api/courseApi";
import { useGetCategoriesQuery } from "@/lib/redux/api/isoStandardsApi";
import { useCheckEnrollmentMutation } from "@/lib/redux/features/auth/authApi";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";
import ReviewSection from "@/components/AIAssistant/ReviewSection";

const CategoryCoursesPage = () => {
  const { t } = useTranslation();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const categoryParam = (params?.categoryName as string) || "";

  // Clean up the category param string
  const decodedCategory = decodeURIComponent(categoryParam).toLowerCase();

  const router = useRouter();
  const coursesSectionRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 12;

  const token = useSelector(selectCurrentToken);
  const { data: popularCourses, isLoading, isError } = useGetCoursesQuery({ limit: 100 });
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetCategoriesQuery();
  const [checkEnrollment] = useCheckEnrollmentMutation();

  const CATEGORY_LABELS: Record<string, string> = {
    "quality": t('academy.quality'),
    "security": t('academy.security'),
    "environmental": t('academy.environmental'),
    "health": t('academy.health')
  };

  const displayCategoryName = CATEGORY_LABELS[decodedCategory] || decodedCategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Dynamic Category lookup from backend
  const currentCategory = useMemo(() => {
    if (!categoriesData?.data) return null;
    return categoriesData.data.find(
      (cat: any) => cat.slug?.toLowerCase() === decodedCategory
    );
  }, [categoriesData, decodedCategory]);

  const meta = useMemo(() => {
    const title = currentCategory?.name || displayCategoryName;
    const subtitle = currentCategory?.standardSub || `${title} Compliance & Standards`;
    const desc = currentCategory?.description || currentCategory?.courseDesc || currentCategory?.standardDesc || "Master compliance requirements and prepare for certification audits with our interactive AI environments.";
    return {
      title,
      subtitle,
      desc
    };
  }, [currentCategory, displayCategoryName]);

  const courses = useMemo(() => {
    if (!popularCourses) return [];

    return popularCourses.filter((course: any) => {
      if (course.category?.slug?.toLowerCase() === decodedCategory) return true;

      const categoryName = course.category?.name?.toLowerCase() || "";
      const courseTitle = course.title?.toLowerCase() || "";
      const decodedWithoutHyphens = decodedCategory.replace(/-/g, ' ');

      return categoryName.includes(decodedWithoutHyphens) ||
        courseTitle.includes(decodedWithoutHyphens) ||
        (decodedCategory === "quality" && (categoryName.includes("9001") || courseTitle.includes("9001"))) ||
        (decodedCategory === "security" && (categoryName.includes("27001") || courseTitle.includes("27001"))) ||
        (decodedCategory === "environmental" && (categoryName.includes("14001") || courseTitle.includes("14001"))) ||
        (decodedCategory === "health" && (categoryName.includes("health") || categoryName.includes("safety")));
    });
  }, [popularCourses, decodedCategory]);

  const totalPages = Math.ceil(courses.length / coursesPerPage);
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * coursesPerPage;
    return courses.slice(startIndex, startIndex + coursesPerPage);
  }, [courses, currentPage]);

  const totalCpdHours = useMemo(() => {
    return courses.reduce((sum, course) => sum + (course.cpdHours || 0), 0);
  }, [courses]);

  const totalModules = useMemo(() => {
    return courses.reduce((sum, course) => sum + (course._count?.lessons || 0), 0);
  }, [courses]);

  const [enrollmentStatus, setEnrollmentStatus] = useState<Record<string, boolean>>({});
  const [isCheckingId, setIsCheckingId] = useState<string | null>(null);

  const checkIsEnrolled = (result: any) => {
    return (
      result?.enrolled === true ||
      result?.isEnrolled === true ||
      result?.isPurchased === true ||
      result?.data?.enrolled === true ||
      result?.data?.isEnrolled === true ||
      result?.data?.isPurchased === true
    );
  };

  useEffect(() => {
    if (!token || !courses || courses.length === 0) return;
    const activatedCourses = JSON.parse(localStorage.getItem("activated_courses") || "[]");

    const verifyEnrollments = async () => {
      courses.forEach(async (course: any) => {
        if (!activatedCourses.includes(course.id)) return;

        try {
          const result = await checkEnrollment({ courseId: course.id }).unwrap();
          if (checkIsEnrolled(result)) {
            setEnrollmentStatus((prev) => ({ ...prev, [course.id]: true }));
          }
        } catch (err: any) {
          if (err?.data?.message === "Already enrolled" || err?.status === 400) {
            setEnrollmentStatus((prev) => ({ ...prev, [course.id]: true }));
          }
        }
      });
    };

    verifyEnrollments();
  }, [token, courses.length, checkEnrollment]);

  const handleEnrollClick = async (e: React.MouseEvent<HTMLButtonElement>, courseId: string) => {
    e.preventDefault();

    if (!token) {
      router.push(`/${lang}/auth/login?courseId=${courseId}`);
      return;
    }

    if (!!enrollmentStatus[courseId]) {
      router.push(`/${lang}/academy/${courseId}`);
      return;
    }

    try {
      setIsCheckingId(courseId);
      const result = await checkEnrollment({ courseId }).unwrap();

      if (checkIsEnrolled(result) || result?.success === true) {
        const activatedCourses = JSON.parse(localStorage.getItem("activated_courses") || "[]");
        if (!activatedCourses.includes(courseId)) {
          activatedCourses.push(courseId);
          localStorage.setItem("activated_courses", JSON.stringify(activatedCourses));
        }

        setEnrollmentStatus((prev) => ({ ...prev, [courseId]: true }));
        toast.success(t('auth.redirecting'));
        setTimeout(() => { router.push(`/${lang}/academy/${courseId}`); }, 1000);
      } else {
        router.push(`/${lang}/pricing?courseId=${courseId}`);
      }
    } catch (error: any) {
      const isAlreadyEnrolled = error?.data?.message === "Already enrolled" || error?.status === 400;

      if (isAlreadyEnrolled) {
        const activatedCourses = JSON.parse(localStorage.getItem("activated_courses") || "[]");
        if (!activatedCourses.includes(courseId)) {
          activatedCourses.push(courseId);
          localStorage.setItem("activated_courses", JSON.stringify(activatedCourses));
        }
        setEnrollmentStatus((prev) => ({ ...prev, [courseId]: true }));
        router.push(`/${lang}/academy/${courseId}`);
      } else {
        router.push(`/${lang}/pricing?courseId=${courseId}`);
      }
    } finally {
      setIsCheckingId(null);
    }
  };

  const scrollToCourses = () => {
    coursesSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ background: "var(--ib-bg)", minHeight: "100vh", fontFamily: "'Inter', sans-serif", paddingTop: "100px", paddingBottom: "100px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>

        {/* Back Link */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/${lang}/academy`)}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid var(--ib-line)",
              borderRadius: "99px", display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
              cursor: "pointer", color: "var(--ib-ink)", transition: "all 0.2s", fontSize: 14, fontWeight: 600
            }}
            className="hover:bg-[var(--ib-accbg)] transition-colors"
          >
            <ArrowLeft size={16} /> {t('academy.backToAcademy', 'Back to Academy')}
          </button>
        </div>

        {/* Category Banner Image */}
        <div style={{
          position: "relative",
          width: "100%",
          height: "380px",
          borderRadius: "24px",
          border: "1px solid var(--ib-line)",
          overflow: "hidden",
          marginBottom: "40px",
          background: "rgba(22, 26, 34, 0.4)",
        }}>
          {courses[0]?.thumbnail?.trim() ? (
            <>
              <Image
                src={courses[0].thumbnail}
                alt={meta.title}
                fill
                style={{ objectFit: "cover", opacity: 0.85 }}
                priority
              />
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(11, 15, 25, 0.1) 0%, rgba(11, 15, 25, 0.7) 100%)"
              }} />
            </>
          ) : (
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, rgba(27, 77, 219, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)"
            }} />
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(27, 77, 219,0.08),transparent_70%)]" />
        </div>

        {/* Two-Column Category Header & Featured Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-center">
          {/* Left Column: Title & Subtitle */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--ib-ink)] m-0 leading-tight">
              {meta.title}
            </h2>
            <p className="text-lg sm:text-xl text-[var(--ib-acc)] font-medium tracking-wide">
              {meta.subtitle}
            </p>
            <p className="font-inter text-[var(--ib-mute)] text-sm sm:text-base leading-relaxed max-w-2xl">
              {meta.desc}
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={scrollToCourses}
                style={{
                  background: "var(--ib-acc)",
                  color: "var(--ib-bg)",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 28px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                className="hover:scale-[1.02] active:scale-[0.98] transition-all hover:shadow-[0_0_20px_rgba(27, 77, 219,0.25)]"
              >
                {t('academy.browseCourses', 'Browse Courses')}
              </button>
              <Link href={`/${lang}/pricing`} style={{ textDecoration: "none" }}>
                <button
                  style={{
                    background: "rgba(27, 77, 219, 0.05)",
                    color: "var(--ib-acc)",
                    border: "1px solid rgba(27, 77, 219, 0.25)",
                    borderRadius: 12,
                    padding: "14px 28px",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  className="hover:bg-[var(--ib-acc)]/15 transition-colors"
                >
                  {t('academy.startFreeTrial', 'Start Free Trial')}
                </button>
              </Link>
            </div>
          </div>

          {/* Right Column: Featured Course Card */}
          <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
            {courses[0] && (
              <div style={{
                background: "var(--ib-bg)",
                borderRadius: 20,
                border: "1px solid var(--ib-line)",
                padding: 24,
                width: "100%",
                maxWidth: 420,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
              }} className="text-left">
                <span style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "var(--ib-mute)",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  {t('academy.featuredCourse', 'Featured Program')}
                </span>

                <h3 className="font-sans text-lg sm:text-xl font-bold text-[var(--ib-ink)] mt-3 mb-2 leading-snug">
                  {courses[0].title}
                </h3>

                <p style={{ color: "var(--ib-mute)", fontSize: 13, lineHeight: 1.4, margin: "0 0 20px 0" }}>
                  {courses[0].description ? (courses[0].description.slice(0, 150) + "...") : "Master implementation guidelines and prep for audit certification."}
                </p>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 16,
                  paddingBottom: 16,
                  borderTop: "1px solid var(--ib-line)",
                  fontSize: 12,
                  color: "var(--ib-mute)"
                }}>
                  <span className="flex items-center gap-2">
                    <BookOpen size={14} color="var(--ib-acc)" />
                    {courses[0]._count?.lessons || 12} {t('academy.lessons', 'Modules')}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock size={14} color="var(--ib-acc)" />
                    {courses[0].cpdHours || 0} CPD Hours
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button
                    onClick={(e) => handleEnrollClick(e, courses[0].id)}
                    disabled={isCheckingId === courses[0].id}
                    style={{
                      width: "100%", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer",
                      background: (token && enrollmentStatus[courses[0].id]) ? "var(--ib-acc)" : "rgba(255,255,255,0.05)", 
                      color: (token && enrollmentStatus[courses[0].id]) ? "black" : "#FFFFFF", 
                      border: (token && enrollmentStatus[courses[0].id]) ? "none" : "1px solid var(--ib-line)",
                      transition: "all 0.2s"
                    }}
                    className="hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isCheckingId === courses[0].id ? (
                      t('academy.verifying', 'Verifying...')
                    ) : (token && enrollmentStatus[courses[0].id]) ? (
                      <>{t('academy.continueLearning', 'Continue Learning')} <PlayCircle size={16} /></>
                    ) : (
                      <>{t('academy.viewSyllabus', 'View Syllabus')} <BookOpen size={16} /></>
                    )}
                  </button>
                  <button
                    onClick={() => window.open('https://dashboard.isobrain.ai/user/certificates', '_blank')}
                    style={{
                      width: "100%", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer",
                      background: (token && enrollmentStatus[courses[0].id]) ? "var(--ib-acc)" : "rgba(255,255,255,0.05)", 
                      color: (token && enrollmentStatus[courses[0].id]) ? "black" : "#FFFFFF", 
                      border: (token && enrollmentStatus[courses[0].id]) ? "none" : "1px solid var(--ib-line)",
                      transition: "all 0.2s"
                    }}
                    className="hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {t('academy.viewSampleCertificate', 'View Sample Certificate')} <Award size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CPD Information Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: 24,
          marginBottom: 64
        }}>
          {/* Card 1 */}
          <div style={{
            background: "var(--ib-bg)", borderRadius: 16, border: "1px solid var(--ib-line)",
            padding: 24, display: "flex", gap: 16, alignItems: "start"
          }}>
            <div style={{
              background: "rgba(27, 77, 219,0.08)",
              borderRadius: 12, padding: 12, display: "flex", alignItems: "center", justifyItems: "center"
            }}>
              <Clock size={24} color="var(--ib-acc)" />
            </div>
            <div className="text-left">
              <h4 style={{ color: "var(--ib-ink)", fontSize: 16, fontWeight: 700, margin: "0 0 8px 0" }}>
                {totalCpdHours} {t('academy.cpdHours', 'CPD Hours')}
              </h4>
              <p style={{ color: "var(--ib-mute)", fontSize: 13, lineHeight: 1.4, margin: 0 }}>
                {t('academy.cpdHoursDesc', 'Accredited Continuing Professional Development hours directly trackable upon course completion.')}
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div style={{
            background: "var(--ib-bg)", borderRadius: 16, border: "1px solid var(--ib-line)",
            padding: 24, display: "flex", gap: 16, alignItems: "start"
          }}>
            <div style={{
              background: "rgba(27, 77, 219,0.08)",
              borderRadius: 12, padding: 12, display: "flex", alignItems: "center", justifyItems: "center"
            }}>
              <Award size={24} color="var(--ib-acc)" />
            </div>
            <div className="text-left">
              <h4 style={{ color: "var(--ib-ink)", fontSize: 16, fontWeight: 700, margin: "0 0 8px 0" }}>
                {t('academy.accreditedCert', 'Accredited CPD Certification')}
              </h4>
              <p style={{ color: "var(--ib-mute)", fontSize: 13, lineHeight: 1.4, margin: 0 }}>
                {t('academy.cpdCertDesc', 'Earn a verified Certificate of Competency recognized globally by leading standard auditing bodies.')}
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div style={{
            background: "var(--ib-bg)", borderRadius: 16, border: "1px solid var(--ib-line)",
            padding: 24, display: "flex", gap: 16, alignItems: "start"
          }}>
            <div style={{
              background: "rgba(27, 77, 219,0.08)",
              borderRadius: 12, padding: 12, display: "flex", alignItems: "center", justifyItems: "center"
            }}>
              <Brain size={24} color="var(--ib-acc)" />
            </div>
            <div className="text-left">
              <h4 style={{ color: "var(--ib-ink)", fontSize: 16, fontWeight: 700, margin: "0 0 8px 0" }}>
                {t('academy.neuralVerify', 'Neural Simulation Checked')}
              </h4>
              <p style={{ color: "var(--ib-mute)", fontSize: 13, lineHeight: 1.4, margin: 0 }}>
                {t('academy.neuralVerifyDesc', 'Engage in custom interactive audit lens exercises powered by our neural compliance engines.')}
              </p>
            </div>
          </div>
        </div>

        {/* Loading / Error Fallbacks */}
        {isLoading && (
          <div style={{ color: "var(--ib-acc)", textAlign: "center", padding: "40px 0" }}>{t('academy.loadingCourses')}</div>
        )}

        {isError && (
          <div style={{ color: "#EF4444", textAlign: "center", padding: "40px 0" }}>{t('academy.failedLoad')}</div>
        )}

        {!isLoading && !isError && courses.length === 0 && (
          <div style={{ color: "var(--ib-mute)", textAlign: "center", padding: "40px 0", fontSize: 18 }}>
            No courses found for this category.
          </div>
        )}

        {!isLoading && !isError && courses.length > 0 && (
          <>
            {/* Available Programs Header */}
            <div ref={coursesSectionRef} style={{ marginTop: 64, marginBottom: 32 }} className="text-left">
              <h2 className="text-2xl sm:text-4xl font-bold text-[var(--ib-ink)] mb-2">
                {t('academy.availablePrograms', 'Available Programs')}
              </h2>
              <p className="font-inter text-sm sm:text-base text-[var(--ib-mute)] m-0">
                {t('academy.availableProgramsDesc', 'Fully accredited ISO courses built for immediate corporate auditing competency.')}
              </p>
            </div>

            {/* Courses Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
              gap: 32
            }}>
              <AnimatePresence mode="popLayout">
                {paginatedCourses.map((course: any) => {
                  const isPurchased = token ? !!enrollmentStatus[course.id] : false;

                  return (
                    <motion.div
                      key={course.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover="hover"
                      style={{
                        background: "var(--ib-bg)", borderRadius: 20, border: "1px solid var(--ib-line)",
                        overflow: "hidden", position: "relative", display: "flex", flexDirection: "column"
                      }}
                    >
                      {/* Hover Glow Effect */}
                      <motion.div
                        variants={{ hover: { opacity: 1 } }}
                        initial={{ opacity: 0 }}
                        style={{
                          position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%, rgba(27, 77, 219, 0.1), transparent 70%)",
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
                            border: "1px solid var(--ib-line)", display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
                          }}>
                            <ShieldCheck size={40} color="var(--ib-acc)" />
                          </div>
                        )}

                        {isPurchased && (
                          <div style={{ position: "absolute", top: 16, right: 16, background: "var(--ib-acc)", color: "#000000", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {t('academy.enrolled')}
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div style={{ padding: 24, display: "flex", flexDirection: "column", flex: 1, zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.02)" }} className="text-left">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                          <span style={{ color: "var(--ib-acc)", fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {displayCategoryName}
                          </span>
                        </div>
                        <h3 className="font-inter text-base sm:text-xl lg:text-[22px] font-semibold text-[var(--ib-ink)] mb-4 leading-snug">
                          {course.title}
                        </h3>

                        {/* Meta Tags */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                          <span className="font-inter" style={{ background: "rgba(255,255,255,0.05)", color: "var(--ib-mute)", fontSize: 12, padding: "4px 10px", borderRadius: 6 }}>
                            {t('academy.proLevel')}
                          </span>
                          <span className="font-inter" style={{ background: "rgba(255,255,255,0.05)", color: "var(--ib-mute)", fontSize: 12, padding: "4px 10px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6 }}>
                            <Clock size={12} /> {course._count?.lessons || 12} {t('academy.modules')}
                          </span>
                          <span className="font-inter" style={{ background: "rgba(27, 77, 219, 0.1)", color: "var(--ib-acc)", fontSize: 12, padding: "4px 10px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6 }}>
                            {t('academy.aiAssisted')}
                          </span>
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: 24 }}>
                          <p style={{ color: "var(--ib-mute)", fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                            {course.description || "Master the requirements and implementation strategies for this ISO standard with our interactive AI tutor."}
                          </p>
                        </div>

                        {/* CTA Button */}
                        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                          <button
                            onClick={(e) => handleEnrollClick(e, course.id)}
                            disabled={isCheckingId === course.id}
                            style={{
                              width: "100%", padding: "14px 20px", borderRadius: 12, fontSize: 15, fontWeight: 700,
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer",
                              background: isPurchased ? "var(--ib-acc)" : "rgba(255,255,255,0.05)", color: isPurchased ? "black" : "#FFFFFF", border: isPurchased ? "none" : "1px solid var(--ib-line)",
                              transition: "all 0.2s"
                            }}
                            className="hover:scale-[1.02] active:scale-[0.98]"
                          >
                            {isCheckingId === course.id ? (
                              t('academy.verifying', 'Verifying...')
                            ) : isPurchased ? (
                              <>{t('academy.continueLearning', 'Continue Learning')} <PlayCircle size={16} /></>
                            ) : (
                              <>{t('academy.viewSyllabus', 'View Syllabus')} <BookOpen size={16} /></>
                            )}
                          </button>
                          
                          <button
                            onClick={() => window.open('https://dashboard.isobrain.ai/user/certificates', '_blank')}
                            style={{
                              width: "100%", padding: "14px 20px", borderRadius: 12, fontSize: 15, fontWeight: 700,
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer",
                              background: isPurchased ? "var(--ib-acc)" : "rgba(255,255,255,0.05)", color: isPurchased ? "black" : "#FFFFFF", border: isPurchased ? "none" : "1px solid var(--ib-line)",
                              transition: "all 0.2s"
                            }}
                            className="hover:scale-[1.02] active:scale-[0.98]"
                          >
                            {t('academy.viewSampleCertificate', 'View Sample Certificate')} <Award size={16} />
                          </button>
                        </div>
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
                    color: currentPage === 1 ? "rgba(255,255,255,0.2)" : "var(--ib-acc)",
                    border: "1px solid var(--ib-line)",
                    padding: "8px 16px", borderRadius: 8, cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    fontSize: 14, fontWeight: 600, transition: "all 0.2s"
                  }}
                >
                  {t('library.prev')}
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: currentPage === i + 1 ? "var(--ib-acc)" : "rgba(255,255,255,0.05)",
                      color: currentPage === i + 1 ? "var(--ib-bg)" : "#FFFFFF",
                      border: `1px solid ${currentPage === i + 1 ? "var(--ib-acc)" : "rgba(255,255,255,0.1)"}`,
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
                    color: currentPage === totalPages ? "rgba(255,255,255,0.2)" : "var(--ib-acc)",
                    border: "1px solid var(--ib-line)",
                    padding: "8px 16px", borderRadius: 8, cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    fontSize: 14, fontWeight: 600, transition: "all 0.2s"
                  }}
                >
                  {t('library.next')}
                </button>
              </div>
            )}
          </>
        )}



        {/* AI Disclaimer / Neural Layer Footer Notice */}
        <div style={{
          background: "linear-gradient(90deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0.02) 100%)",
          borderRadius: 20, border: "1px solid var(--ib-card)", padding: "32px 40px",
          marginTop: 100, marginBottom: 80, display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap"
        }} className="text-left">
          <div style={{
            background: "rgba(27, 77, 219, 0.05)", border: "1px solid rgba(27, 77, 219, 0.1)",
            width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Sparkles size={24} color="var(--ib-acc)" />
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <h5 style={{ color: "var(--ib-ink)", fontSize: 15, fontWeight: 700, margin: "0 0 8px 0" }}>
              {t('academy.disclaimerTitle', 'Neural Environment Disclaimer')}
            </h5>
            <p style={{ color: "var(--ib-mute)", fontSize: 13, lineHeight: 1.5, margin: 0 }}>
              {t('academy.disclaimerText', 'ISOBrain Compliance Suite operates simulated sandbox frameworks. Course outlines, progress tracking, dynamic tutorials, and gap audits are generated in real-time by compliance models. Certifications and CPD credits align with control module verification.')}
            </p>
          </div>
        </div>

      </div>

      <ReviewSection hideCTA={true} className="pb-10 lg:pb-32 pt-10 bg-transparent" />
    </div>
  );
};

export default CategoryCoursesPage;
