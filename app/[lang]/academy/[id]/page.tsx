"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronDown, MessageCircle, Send, CheckCircle2, XCircle, X, StickyNote, PlayCircle, FilePenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetCourseByIdQuery, useAcademyChatBotMutation, useCreateNoteMutation } from "@/lib/redux/features/academy/academyApi";
import TypewriterMarkdown from "@/components/Shared/TypewriterMarkdown";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "@/lib/redux/features/auth/authSlice";
import { useCheckEnrollmentMutation } from "@/lib/redux/features/auth/authApi";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n/client";
import { ActivityTracker } from "@/components/activity/ActivityTracker";

export default function AcademyCoursePage({
  params,
}: {
  params: Promise<{ lang?: string; id: string }>;
}) {
  const { t } = useTranslation();
  const [resolvedParams, setResolvedParams] = React.useState<{ lang?: string; id: string } | null>(null);
  const router = useRouter();
  const token = useSelector(selectCurrentToken);
  const [checkEnrollment] = useCheckEnrollmentMutation();
  const [isAccessVerified, setIsAccessVerified] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(true);
  const [isMobileCurriculumOpen, setIsMobileCurriculumOpen] = React.useState(false);

  React.useEffect(() => {
    void Promise.resolve(params).then(setResolvedParams);
  }, [params]);

  // Sync i18n language
  React.useEffect(() => {
    if (resolvedParams?.lang && i18n.language !== resolvedParams.lang) {
      i18n.changeLanguage(resolvedParams.lang);
    }
  }, [resolvedParams?.lang]);

  // Fetch course data by ID from /courses/:id (public freemium shell + free lessons)
  const courseId = resolvedParams?.id ?? "";
  const { data: courseData, isLoading, isError, error: courseError } = useGetCourseByIdQuery(courseId, {
    skip: !courseId || !isAccessVerified,
  });

  const course = courseData?.data;
  const lessons = course?.lessons?.slice().sort((a, b) => a.order - b.order) ?? [];
  const hasFullAccess = course?.hasFullAccess === true;
  const freeLessonLimit = course?.freeLessonLimit ?? 2;

  // Handle errors from course data fetch
  React.useEffect(() => {
    if (courseError) {
      const err = courseError as any;
      if (err?.status === 404 || err?.data?.statusCode === 404) {
        toast.error(err?.data?.message || "Course not found");
      }
    }
  }, [courseError, t]);

  const [currentLessonIndex, setCurrentLessonIndex] = React.useState(0);
  const [completedLessons, setCompletedLessons] = React.useState<Set<string>>(new Set());

  // Restore completed lessons from localStorage
  React.useEffect(() => {
    if (courseId && typeof window !== "undefined") {
      const stored = localStorage.getItem(`academy_completed_${courseId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCompletedLessons(new Set(parsed));
          }
        } catch (e) {
          console.error("Failed to parse stored lessons", e);
        }
      }
    }
  }, [courseId]);

  // Save completed lessons to localStorage when updated
  React.useEffect(() => {
    if (courseId && typeof window !== "undefined") {
      if (completedLessons.size > 0) {
        localStorage.setItem(`academy_completed_${courseId}`, JSON.stringify(Array.from(completedLessons)));
      }
    }
  }, [completedLessons, courseId]);

  const [quizAnswers, setQuizAnswers] = React.useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = React.useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [aiQuestion, setAiQuestion] = React.useState("");
  const [aiMessages, setAiMessages] = React.useState<
    { role: "user" | "ai"; text: string; followups?: string[]; sources?: string[] }[]
  >([]);
  const [chatSessionId, setChatSessionId] = React.useState<string | null>(null);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const isUserScrolledUp = React.useRef(false);
  const lastChatScrollTop = React.useRef(0);
  const [sendAiChat, { isLoading: isChatLoading }] = useAcademyChatBotMutation();
  const [createNote, { isLoading: isSavingNote }] = useCreateNoteMutation();
  const [isNoteOpen, setIsNoteOpen] = React.useState(false);
  const [noteContent, setNoteContent] = React.useState("");
  const [savedNotes, setSavedNotes] = React.useState<{ content: string; createdAt: string }[]>([]);

  // Reset Ask AI session when switching courses (keep history within a course for follow-ups)
  React.useEffect(() => {
    setChatSessionId(null);
    setAiMessages([]);
  }, [courseId]);

  // Freemium access: course player is open for visitors & free users.
  // Backend redacts lessons beyond the first two unless COURSES entitlement is present.
  React.useEffect(() => {
    if (!resolvedParams?.id) return;
    setIsVerifying(true);

    const timer = setTimeout(async () => {
      const activeCourseId = resolvedParams.id;

      let activeToken = token;
      if (!activeToken && typeof document !== "undefined") {
        const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
        if (match) activeToken = match[2];
      }

      // Optional enrollment probe for premium UX — never blocks freemium preview
      if (activeToken) {
        try {
          await checkEnrollment({ courseId: activeCourseId }).unwrap();
        } catch {
          // ignore — free preview still allowed
        }
      }

      setIsAccessVerified(true);
      setIsVerifying(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [resolvedParams?.id, token, checkEnrollment]);

  // Reset quiz state when switching lessons
  React.useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setCurrentQuestionIndex(0);
  }, [currentLessonIndex]);

  const basePath = resolvedParams?.lang ? `/${resolvedParams.lang}` : "";
  const currentLesson = lessons[currentLessonIndex];
  const currentVideo = currentLesson?.video;
  const currentQuizzes = currentLesson?.quizzes ?? [];
  const allQuestions = currentQuizzes.flatMap((q) => q.questions).slice(0, 10);
  const totalLessons = lessons.length;
  const completedCount = completedLessons.size;
  const allLessonsCompleted = totalLessons > 0 && completedCount === totalLessons;

  const isPremiumLocked = (index: number) => {
    const lesson = lessons[index];
    if (!lesson) return true;
    if (hasFullAccess) return false;
    if (typeof lesson.isLocked === "boolean") return lesson.isLocked;
    // Fallback: trust sorted position when API flags are absent
    return index >= freeLessonLimit;
  };

  const isSequentiallyUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevLesson = lessons[index - 1];
    return prevLesson ? completedLessons.has(prevLesson.id) : false;
  };

  /** Free lessons (1–2) are always open; later lessons need premium + prior completion. */
  const isLessonUnlocked = (index: number) => {
    if (isPremiumLocked(index)) return false;
    if (!hasFullAccess) return true; // free preview ranks
    return isSequentiallyUnlocked(index);
  };

  const handleLessonClick = (index: number) => {
    if (isPremiumLocked(index)) {
      const lang = resolvedParams?.lang || "en";
      toast.error("Unlock this lesson with Premium access.", {
        action: {
          label: "Upgrade",
          onClick: () => router.push(`/${lang}/pricing?courseId=${courseId}`),
        },
      });
      return;
    }
    if (isLessonUnlocked(index)) {
      setCurrentLessonIndex(index);
    } else {
      toast.warning("Please complete the previous lesson assessment to unlock this module.");
    }
  };

  // Helper to convert YouTube URL to embed
  const getEmbedUrl = (url: string | undefined): string | null => {
    if (!url) return null;
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const idMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
      const id = idMatch ? idMatch[1] : null;
      return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : url;
    }
    return url;
  };

  const videoSrc = getEmbedUrl(currentVideo?.videoUrl);

  const handleQuizChange = (questionId: string, value: string) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const isQuizAnswerCorrect = (
    selected: string,
    correct: string,
    options: string[] = [],
  ) => {
    const sel = String(selected || "").trim();
    const ans = String(correct || "").trim();
    if (!sel || !ans) return false;
    if (sel === ans || sel.toLowerCase() === ans.toLowerCase()) return true;
    // Trusted answer may be a letter label (A/B/C) while UI stores option text
    const letterMatch = /^[A-D]$/i.exec(ans);
    if (letterMatch) {
      const idx = letterMatch[0].toUpperCase().charCodeAt(0) - 65;
      const byLetter = options[idx];
      if (byLetter && byLetter.trim().toLowerCase() === sel.toLowerCase()) {
        return true;
      }
    }
    const optIdx = options.findIndex(
      (o) => String(o).trim().toLowerCase() === sel.toLowerCase(),
    );
    if (optIdx >= 0) {
      const label = String.fromCharCode(65 + optIdx);
      if (label === ans.toUpperCase()) return true;
    }
    return false;
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
  };

  const goToAdjacentLesson = (direction: -1 | 1) => {
    const nextIndex = currentLessonIndex + direction;
    if (nextIndex < 0 || nextIndex >= lessons.length) return;
    handleLessonClick(nextIndex);
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim() || !courseId) return;
    try {
      await createNote({
        courseId,
        content: noteContent,
      }).unwrap();
      setSavedNotes((prev) => [{ content: noteContent, createdAt: new Date().toISOString() }, ...prev]);
      setNoteContent("");
      setIsNoteOpen(false);
      toast.success("Note saved successfully");
    } catch {
      toast.error("Failed to save note");
    }
  };

  const scrollToBottom = (force = false, smooth = true) => {
    if (!force && isUserScrolledUp.current) return;
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? "smooth" : "instant",
      });
    }
  };

  const handleChatScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    if (scrollTop < lastChatScrollTop.current && !isAtBottom) {
      isUserScrolledUp.current = true;
    } else if (isAtBottom) {
      isUserScrolledUp.current = false;
    }
    lastChatScrollTop.current = scrollTop;
  };

  const handleSendAi = async () => {
    if (!aiQuestion.trim() || isChatLoading) return;
    const userText = aiQuestion.trim();
    setAiQuestion("");
    setAiMessages((prev) => [...prev, { role: "user", text: userText }]);
    isUserScrolledUp.current = false;
    setTimeout(() => scrollToBottom(true), 50);

    try {
      // Align with Library chat contract: messages + context + session_id
      // Backend enriches course/lesson grounding and attaches the linked ISO file.
      const formData = new FormData();
      formData.append("messages", userText);
      formData.append(
        "context",
        JSON.stringify({
          purpose: "course_learning",
          courseId: course?.id || courseId || undefined,
          lessonId: currentLesson?.id || undefined,
          isoStandardId: course?.isoStandard?.id || undefined,
          courseTitle: course?.title || undefined,
          lessonTitle: currentLesson?.title || undefined,
        }),
      );
      if (chatSessionId) {
        formData.append("session_id", chatSessionId);
      }

      const response = await sendAiChat(formData as any).unwrap();

      if (response?.data?.session_id && response.data.session_id !== chatSessionId) {
        setChatSessionId(response.data.session_id);
      }

      const aiText = (
        response?.data?.response ||
        response?.data?.answer ||
        ""
      ).trim();
      const followups = response?.data?.suggested_followups;
      const sources = response?.data?.sources;
      setAiMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            aiText ||
            "I couldn't find enough information in the current course material or connected knowledge sources to answer that confidently.",
          followups: Array.isArray(followups) ? followups.slice(0, 4) : undefined,
          sources: Array.isArray(sources)
            ? sources.filter((s: unknown) => typeof s === "string" && s.trim()).slice(0, 6)
            : undefined,
        },
      ]);
      setTimeout(() => scrollToBottom(true), 100);
    } catch (err: any) {
      const serverMsg =
        err?.data?.message ||
        err?.error ||
        "Encountered a connection error. Please verify your query and retry.";
      setAiMessages((prev) => [
        ...prev,
        { role: "ai", text: serverMsg },
      ]);
    }
  };

  // ─── Loading / Error states ───────────────────────────────────────────────

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[var(--ib-bg)] flex items-center justify-center font-inter">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--ib-acc)] border-t-transparent" />
          <p className="text-[var(--ib-mute)] font-medium">{t('academy.coursePlayer.verifyingAccess')}</p>
        </div>
      </div>
    );
  }

  if (!isAccessVerified) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--ib-bg)] flex items-center justify-center font-inter">
        <div className="flex flex-col items-center gap-4">
          <p className="text-[var(--ib-mute)] font-medium">{t('academy.coursePlayer.loadingContent')}</p>
        </div>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="min-h-screen bg-[var(--ib-bg)] flex items-center justify-center p-6 font-inter">
        <div className="max-w-md bg-[var(--ib-card)] p-8 rounded-2xl shadow-sm border border-[var(--ib-line)] text-center">
          <h2 className="text-xl font-bold text-[var(--ib-ink)] mb-2">{t('academy.coursePlayer.somethingWentWrong')}</h2>
          <p className="text-[var(--ib-mute)] mb-6">{t('academy.coursePlayer.couldNotLoadCourse')}</p>
          <Button onClick={() => window.location.reload()} className="bg-[var(--ib-acc)] text-[var(--ib-bg)] px-8 py-2 rounded-lg font-bold">
            {t('academy.coursePlayer.retry')}
          </Button>
        </div>
      </div>
    );
  }

  // ─── Main Render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--ib-bg)] font-inter text-[var(--ib-ink)] relative overflow-hidden">
      <ActivityTracker
        source="ACADEMY"
        enabled={Boolean(token && isAccessVerified && courseId && currentLesson?.id)}
        courseId={courseId}
        lessonId={currentLesson?.id}
        resourceLabel={currentLesson?.title || course?.title}
        sessionKey={`academy_${courseId}`}
      />
      {/* Background Glows */}
      <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-[var(--ib-acc)]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[600px] h-[600px] bg-[var(--ib-acc)]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto px-4 pt-24 pb-12 sm:px-6 lg:px-8 relative z-10 max-w-[1800px]">
        {/* ── Top Header Bar (Breadcrumb & Course Meta) ── */}
        <div className="mb-6 bg-[var(--ib-card)] backdrop-blur-md rounded-2xl border border-[var(--ib-line)] p-5 md:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <Link
                href={`${basePath}/academy`}
                className="inline-flex items-center gap-2 text-xs md:text-sm text-[var(--ib-acc)] font-bold hover:opacity-80 transition-all uppercase tracking-wider"
              >
                <ChevronLeft className="h-4 w-4" />
                {t('academy.coursePlayer.courseCatalog')}
              </Link>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[var(--ib-ink)] tracking-tight">{course.title}</h1>
              <div className="flex items-center gap-3 text-xs text-[var(--ib-mute)] flex-wrap">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--ib-accbg)] border border-[var(--ib-line)]">
                  {t('academy.coursePlayer.instructor')}: <span className="text-[var(--ib-ink)] font-semibold">{course.instructor}</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--ib-accbg)] border border-[var(--ib-line)]">
                  {course.cpdHours} {t('academy.coursePlayer.cpdHours')}
                </span>
                {course.category?.name && (
                  <span className="px-2.5 py-1 rounded-md bg-[var(--ib-acc)]/10 border border-[var(--ib-acc)]/20 text-[var(--ib-acc)] font-medium">
                    {course.category.name}
                  </span>
                )}
                {!hasFullAccess ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-bold text-emerald-600">
                    {t("academy.coursePlayer.freeLessonsBanner", {
                      defaultValue: "First 2 lessons free",
                    })}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Mobile / Tablet Toggle Button for Curriculum (3rd Image) */}
            <div className="xl:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMobileCurriculumOpen(!isMobileCurriculumOpen)}
                className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[var(--ib-acc)]/10 border border-[var(--ib-acc)]/30 text-[var(--ib-acc)] font-bold text-xs uppercase tracking-wider hover:bg-[var(--ib-acc)]/20 transition-all"
              >
                <span className="flex items-center gap-2">
                  <PlayCircle className="h-4 w-4" />
                  {t('academy.coursePlayer.curriculum')} ({completedCount}/{totalLessons})
                </span>
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isMobileCurriculumOpen && "rotate-180")} />
              </button>
            </div>
          </div>

          {/* Mobile Collapsible Curriculum Drawer */}
          {isMobileCurriculumOpen && (
            <div className="xl:hidden mt-4 pt-4 border-t border-[var(--ib-line)]">
              <div className="bg-[var(--ib-bg)] rounded-2xl border border-[var(--ib-line)] p-4 max-h-[60vh] overflow-y-auto space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-black text-[var(--ib-ink)] uppercase tracking-wider">{t('academy.coursePlayer.curriculum')}</h3>
                  <span className="text-xs text-[var(--ib-acc)] font-bold">{completedCount}/{totalLessons} {t('academy.coursePlayer.modulesCompleted')}</span>
                </div>
                <ul className="space-y-2">
                  {lessons.map((lesson, index) => {
                    const isActive = currentLessonIndex === index;
                    const isCompleted = completedLessons.has(lesson.id);
                    const premiumLocked = isPremiumLocked(index);
                    const isUnlocked = isLessonUnlocked(index);
                    const hasQuiz = lesson.quizzes?.some((q) => q.questions?.length > 0);
                    const isFreePreview = !premiumLocked && !hasFullAccess && index < freeLessonLimit;

                    return (
                      <li key={lesson.id}>
                        <button
                          type="button"
                          onClick={() => {
                            handleLessonClick(index);
                            setIsMobileCurriculumOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-start gap-3 rounded-xl border p-3 text-left transition-all duration-300",
                            premiumLocked && "border-amber-200/80 bg-amber-50/40 opacity-90 hover:bg-amber-50",
                            !premiumLocked && !isUnlocked && "cursor-not-allowed border-[var(--ib-line)] bg-[var(--ib-card)] opacity-30",
                            isUnlocked && "hover:border-[var(--ib-line)] hover:bg-[var(--ib-accbg)]",
                            isCompleted && !isActive && "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10",
                            isActive && "border-[var(--ib-acc)] bg-[var(--ib-acc)]/10 shadow-[0_0_15px_rgba(27, 77, 219, 0.1)]",
                            !isCompleted && !isActive && isUnlocked && "border-[var(--ib-line)] bg-[var(--ib-card)]"
                          )}
                        >
                          <span className="mt-0.5 shrink-0 text-base text-[var(--ib-acc)]">
                            {premiumLocked ? "🔒" : isCompleted && !isActive ? "✅" : isActive ? "▶️" : "⏯️"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className={cn(
                              "text-xs md:text-sm font-bold tracking-tight",
                              isActive && "text-[var(--ib-acc)]",
                              isCompleted && !isActive && "text-emerald-400",
                              (premiumLocked || !isUnlocked) && "text-[var(--ib-mute)]",
                              isUnlocked && !isActive && !isCompleted && "text-[var(--ib-ink)]/90"
                            )}>
                              {lesson.title}
                            </p>
                            <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[var(--ib-mute)]/60">
                              {premiumLocked
                                ? "Premium"
                                : isFreePreview
                                  ? "Free"
                                  : lesson.video?.duration || "Modular"}
                              {!premiumLocked && hasQuiz && " · 📝 Assessment"}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* ── Main Layout: Curriculum + YouTube-style video/Ask AI ── */}
        <div className="flex flex-col items-start gap-6 xl:flex-row">

          {/* ── 1. Desktop Left Sidebar: Modules & Curriculum ── */}
          <div className={cn(
            "hidden xl:block shrink-0 sticky top-24 max-h-[calc(100vh-8rem)] transition-all duration-300 ease-in-out",
            isSidebarCollapsed ? "w-[60px]" : "w-[280px]"
          )}>
            <div className="bg-[var(--ib-card)] rounded-2xl border border-[var(--ib-line)] p-3.5 shadow-2xl max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar">
              <div className={cn("flex items-center pb-3 border-b border-[var(--ib-line)]", isSidebarCollapsed ? "justify-center" : "justify-between")}>
                {!isSidebarCollapsed && (
                  <h3 className="text-sm font-black text-[var(--ib-ink)] uppercase tracking-wider">
                    {t('academy.coursePlayer.curriculum')}
                  </h3>
                )}
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className={cn(
                    "p-1.5 text-[var(--ib-ink)]/70 hover:text-white transition-all rounded-lg hover:bg-[var(--ib-accbg)]",
                    isSidebarCollapsed ? "w-full flex justify-center text-[var(--ib-acc)]" : "ml-auto"
                  )}
                  title={isSidebarCollapsed ? "Expand Curriculum" : "Collapse Curriculum"}
                >
                  {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
              </div>

              {isSidebarCollapsed && (
                <div className="py-6 flex flex-col items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setIsSidebarCollapsed(false)}
                    className="p-2.5 rounded-xl bg-[var(--ib-acc)]/10 hover:bg-[var(--ib-acc)]/20 text-[var(--ib-acc)] transition-all shadow-sm"
                    title="Open Curriculum"
                  >
                    <PlayCircle className="h-5 w-5" />
                  </button>
                  <span className="text-[10px] font-black text-[var(--ib-acc)] [writing-mode:vertical-lr] tracking-[0.2em] uppercase">
                    {t('academy.coursePlayer.curriculum')}
                  </span>
                </div>
              )}

              {!isSidebarCollapsed && (
                <ul className="space-y-3">
                  {lessons.map((lesson, index) => {
                    const isActive = currentLessonIndex === index;
                    const isCompleted = completedLessons.has(lesson.id);
                    const premiumLocked = isPremiumLocked(index);
                    const isUnlocked = isLessonUnlocked(index);
                    const hasQuiz = lesson.quizzes?.some((q) => q.questions?.length > 0);
                    const isFreePreview = !premiumLocked && !hasFullAccess && index < freeLessonLimit;

                    return (
                      <li key={lesson.id}>
                        <button
                          type="button"
                          onClick={() => handleLessonClick(index)}
                          className={cn(
                            "w-full flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-300",
                            premiumLocked && "border-amber-200/80 bg-amber-50/40 opacity-90 hover:bg-amber-50",
                            !premiumLocked && !isUnlocked && "cursor-not-allowed border-[var(--ib-line)] bg-[var(--ib-card)] opacity-30",
                            isUnlocked && "hover:border-[var(--ib-line)] hover:bg-[var(--ib-accbg)]",
                            isCompleted && !isActive && "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10",
                            isActive && "border-[var(--ib-acc)] bg-[var(--ib-acc)]/10 shadow-[0_0_15px_rgba(27, 77, 219, 0.1)]",
                            !isCompleted && !isActive && isUnlocked && "border-[var(--ib-line)] bg-[var(--ib-card)]"
                          )}
                        >
                          <span className="mt-0.5 shrink-0 text-base text-[var(--ib-acc)]">
                            {premiumLocked ? "🔒" : isCompleted && !isActive ? "✅" : isActive ? "▶️" : "⏯️"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className={cn(
                              "text-xs font-bold tracking-tight line-clamp-2",
                              isActive && "text-[var(--ib-acc)]",
                              isCompleted && !isActive && "text-emerald-400",
                              (premiumLocked || !isUnlocked) && "text-[var(--ib-mute)]",
                              isUnlocked && !isActive && !isCompleted && "text-[var(--ib-ink)]/90"
                            )}>
                              {lesson.title}
                            </p>
                            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-[var(--ib-mute)]/60">
                              {premiumLocked
                                ? "Premium"
                                : isFreePreview
                                  ? "Free"
                                  : lesson.video?.duration || "Modular"}
                              {!premiumLocked && hasQuiz && " · 📝 Assessment"}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Take Final Exam */}
            {allLessonsCompleted && !isSidebarCollapsed && (
              <Link
                href="#"
                className="mt-4 block w-full rounded-xl bg-emerald-500 px-4 py-3 text-center text-xs font-black text-[var(--ib-bg)] uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:opacity-90 transition-all"
              >
                🎓 {t('academy.coursePlayer.finalExam')}
              </Link>
            )}
          </div>

          {/* ── Main Content: YouTube-style video stage + Ask AI panel ── */}
          <div className="w-full flex-1 min-w-0 space-y-6">

            {/*
              YouTube layout:
              - Desktop/laptop: large video left, Ask AI chat as right sidebar
              - Phone/tablet: video on top, Ask AI stacked below (readable text while learning)
            */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-5">

              {/* Primary stage: Video Player */}
              <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)] shadow-2xl">
                <div className="flex aspect-video w-full items-center justify-center overflow-hidden bg-[#000000]">
                  {isPremiumLocked(currentLessonIndex) ? (
                    <div className="flex flex-col items-center justify-center text-center p-6 bg-[var(--ib-bg)] w-full h-full">
                      <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-3 border border-amber-200 shadow-xl text-2xl">
                        🔒
                      </div>
                      <h3 className="text-base md:text-lg font-bold text-[var(--ib-ink)] mb-1">
                        Unlock this lesson with Premium access.
                      </h3>
                      <p className="text-[var(--ib-mute)] text-xs max-w-xs mx-auto mb-4">
                        The first {freeLessonLimit} lessons in every course are free. Upgrade to continue this path.
                      </p>
                      <Link
                        href={`${basePath}/pricing?courseId=${courseId}`}
                        className="inline-flex items-center justify-center rounded-xl bg-[var(--ib-acc)] px-7 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-[0_14px_32px_-12px_color-mix(in_srgb,var(--ib-acc)_70%,transparent)] transition-all hover:-translate-y-0.5 hover:opacity-95"
                      >
                        {t("academy.coursePlayer.upgradeVisibleCta", {
                          defaultValue: "Upgrade — Unlock Full Course",
                        })}
                      </Link>
                    </div>
                  ) : videoSrc && !videoSrc.includes('youtube.com') && !videoSrc.includes('youtu.be') && !videoSrc.includes('vimeo.com') ? (
                    <video
                      className="w-full h-full object-contain bg-[#000000]"
                      src={videoSrc}
                      controls
                      controlsList="nodownload"
                      preload="metadata"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      {videoSrc ? (
                        <iframe
                          className="absolute inset-0 h-full w-full"
                          src={videoSrc}
                          title={currentVideo?.title ?? "Lesson video"}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[var(--ib-bg)]">
                          <div className="w-14 h-14 rounded-full bg-[var(--ib-accbg)] flex items-center justify-center mb-3 border border-[var(--ib-line)] shadow-xl">
                            <XCircle className="w-7 h-7 text-[var(--ib-ink)]/30" />
                          </div>
                          <h3 className="text-base md:text-lg font-bold text-[var(--ib-ink)] mb-1">{t('academy.coursePlayer.noVideoFound')}</h3>
                          <p className="text-[var(--ib-mute)] text-xs max-w-xs mx-auto">
                            {currentLesson
                              ? t('academy.coursePlayer.noVideoDesc')
                              : t('academy.coursePlayer.selectToStart')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-auto space-y-3 border-t border-[var(--ib-line)] bg-[var(--ib-card)] px-5 py-3.5">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--ib-acc)]">{t('academy.coursePlayer.nowStreaming')}</p>
                      <p className="truncate text-sm font-bold text-[var(--ib-ink)]/90">{currentVideo?.title || t('academy.coursePlayer.selectLesson')}</p>
                    </div>
                    <PlayCircle className="h-5 w-5 shrink-0 text-[var(--ib-acc)] opacity-60" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => goToAdjacentLesson(-1)}
                      disabled={currentLessonIndex <= 0}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-[var(--ib-line)] bg-[var(--ib-bg)] px-3 py-2.5 text-[11px] font-black uppercase tracking-wider text-[var(--ib-ink)] transition-all hover:border-[var(--ib-acc)] hover:bg-[var(--ib-accbg)] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ChevronLeft className="size-4" aria-hidden />
                      {t("academy.coursePlayer.prevLesson", { defaultValue: "Previous" })}
                    </button>
                    <button
                      type="button"
                      onClick={() => goToAdjacentLesson(1)}
                      disabled={currentLessonIndex >= lessons.length - 1}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--ib-acc)] px-3 py-2.5 text-[11px] font-black uppercase tracking-wider text-white shadow-[0_10px_24px_-12px_color-mix(in_srgb,var(--ib-acc)_60%,transparent)] transition-all hover:opacity-92 disabled:cursor-not-allowed disabled:bg-[var(--ib-accbg)] disabled:text-[var(--ib-ink)]/40 disabled:shadow-none"
                    >
                      {t("academy.coursePlayer.nextLessonShort", { defaultValue: "Next lesson" })}
                      <ChevronRight className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>

              {/* Ask AI panel — YouTube-style side chat (desktop) / below player (mobile) */}
              <div className="flex min-h-[420px] w-full flex-col overflow-hidden rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)] shadow-2xl lg:min-h-0 lg:w-[min(100%,400px)] lg:shrink-0">
                {/* Header */}
                <div className="flex shrink-0 items-center gap-3 border-b border-[var(--ib-line)] bg-gradient-to-r from-[var(--ib-acc)]/10 to-transparent px-4 py-3 sm:px-5 sm:py-3.5">
                  <div className="rounded-xl bg-[var(--ib-acc)] p-2 font-bold text-[var(--ib-bg)]">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-black uppercase tracking-wider text-[var(--ib-ink)]">
                      {t('academy.coursePlayer.askAI')}
                    </h2>
                    <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ib-acc)]">
                      {t('academy.coursePlayer.askAiSideHint', {
                        defaultValue: 'Ask in your language · follow with text',
                      })}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2 rounded-full border border-[var(--ib-line)] bg-[var(--ib-accbg)] px-2.5 py-1">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--ib-acc)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--ib-mute)]">
                      {t('academy.coursePlayer.active')}
                    </span>
                  </div>
                </div>

                {/* Chat messages — fills remaining sidebar height like YouTube live chat */}
                <div
                  ref={chatContainerRef}
                  onScroll={handleChatScroll}
                  className="min-h-[260px] flex-1 space-y-4 overflow-y-auto bg-[var(--ib-bg)]/40 p-4 [-ms-overflow-style:none] [scrollbar-width:none] lg:min-h-0 [&::-webkit-scrollbar]:hidden"
                >
                  {aiMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-6">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--ib-accbg)] flex items-center justify-center border border-[var(--ib-line)] text-[var(--ib-acc)] shadow-lg">
                        <MessageCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm md:text-base font-bold text-[var(--ib-ink)] mb-1">{t('academy.coursePlayer.knowledgeSynthesis')}</p>
                        <p className="text-xs text-[var(--ib-mute)] max-w-xs mx-auto leading-relaxed">{t('academy.coursePlayer.askClarify')}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1 justify-center">
                        {[t('academy.coursePlayer.clarifyConcepts'), t('academy.coursePlayer.synthesizeSummary'), t('academy.coursePlayer.implementationPitfalls')].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setAiQuestion(s)}
                            className="text-[10px] font-bold px-3 py-1 rounded-full border border-[var(--ib-line)] text-[var(--ib-mute)] hover:text-white hover:bg-[var(--ib-acc)]/20 hover:border-[var(--ib-acc)]/40 transition-all"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {aiMessages.map((m, i) => (
                        <div key={i} className={`flex gap-3 items-start ${m.role === "user" ? "justify-end" : "justify-start w-full"}`}>
                          <div className={cn(
                            "rounded-2xl p-3.5 text-xs md:text-sm leading-relaxed",
                            m.role === "user"
                              ? "max-w-[85%] bg-[var(--ib-acc)]/15 text-[var(--ib-ink)] border border-[var(--ib-acc)]/30 rounded-tr-sm"
                              : "w-full bg-[var(--ib-card)] border border-[var(--ib-line)] text-[var(--ib-ink)] rounded-tl-sm shadow-lg"
                          )}>
                            {m.role === "ai" && i === aiMessages.length - 1 ? (
                              <TypewriterMarkdown
                                content={m.text}
                                onUpdate={() => scrollToBottom(false, false)}
                              />
                            ) : m.role === "ai" ? (
                              <TypewriterMarkdown
                                content={m.text}
                                speed={0}
                              />
                            ) : (
                              m.text
                            )}
                            {m.role === "ai" && m.sources && m.sources.length > 0 && (
                              <div className="mt-3 pt-2 border-t border-[var(--ib-line)]">
                                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--ib-mute)]">Sources</p>
                                <ul className="space-y-1">
                                  {m.sources.map((s, si) => (
                                    <li key={si} className="text-[10px] text-[var(--ib-mute)] leading-snug">• {s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {m.role === "ai" && m.followups && m.followups.length > 0 && i === aiMessages.length - 1 && !isChatLoading && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {m.followups.map((f) => (
                                  <button
                                    key={f}
                                    type="button"
                                    onClick={() => setAiQuestion(f)}
                                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[var(--ib-line)] text-[var(--ib-mute)] hover:text-white hover:border-[var(--ib-acc)]/40 hover:bg-[var(--ib-acc)]/10 transition-all text-left"
                                  >
                                    {f}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex gap-2 justify-start">
                          <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-md flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-[var(--ib-acc)] animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="h-2 w-2 rounded-full bg-[var(--ib-acc)] animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="h-2 w-2 rounded-full bg-[var(--ib-acc)] animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </>
                  )}
                </div>

                {/* Chat Input — pinned to bottom of Ask AI panel */}
                <div className="shrink-0 border-t border-[var(--ib-line)] bg-[var(--ib-card)] p-3 sm:p-3.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !isChatLoading && handleSendAi()}
                      disabled={isChatLoading}
                      placeholder={t('academy.coursePlayer.queryAIArchitect')}
                      className="min-w-0 flex-1 rounded-xl border border-[var(--ib-line)] bg-[var(--ib-bg)] px-4 py-2.5 text-xs text-[var(--ib-ink)] placeholder:text-[var(--ib-mute)] transition-all focus:border-[var(--ib-acc)]/50 focus:outline-none disabled:opacity-60 md:text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleSendAi}
                      disabled={!aiQuestion.trim() || isChatLoading}
                      aria-label="Send message"
                      title="Send"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--ib-acc)]/30 bg-[var(--ib-acc)] text-[var(--ib-bg)] shadow-[0_0_12px_rgba(27,77,219,0.35)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-100 disabled:brightness-75"
                    >
                      <Send className="h-4 w-4 stroke-[2.5]" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Progress bar */}
            <div className="bg-[var(--ib-card)] rounded-2xl border border-[var(--ib-line)] p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--ib-mute)] font-medium uppercase tracking-widest">
                  {completedCount} {t('academy.coursePlayer.of')} {totalLessons} {t('academy.coursePlayer.modulesCompleted')}
                </span>
                <span className="text-[var(--ib-acc)] font-black">{Math.round(totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--ib-accbg)] border border-[var(--ib-line)]">
                <div
                  className="h-full rounded-full bg-[var(--ib-acc)] transition-all duration-700 shadow-[0_0_10px_rgba(27, 77, 219,0.4)]"
                  style={{ width: `${totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Lesson Knowledge Check / Quiz */}
            {allQuestions.length > 0 && (
              <div className="rounded-2xl bg-[var(--ib-card)] border border-[var(--ib-line)] p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--ib-line)]">
                  <div className="p-2.5 rounded-xl bg-[var(--ib-acc)]/10 border border-[var(--ib-acc)]/20 text-[var(--ib-acc)]">
                    📝
                  </div>
                  <div>
                    <h2 className="text-base font-black text-[var(--ib-ink)] uppercase tracking-wider">{t('academy.coursePlayer.lessonKnowledgeCheck')}</h2>
                    <p className="text-xs text-[var(--ib-mute)] mt-0.5">{t('academy.coursePlayer.quizTrigger')}</p>
                  </div>
                </div>

                {/* Quiz Content */}
                {(() => {
                  if (quizSubmitted) {
                    const PASS_MARK = 0.5;
                    const reviewed = allQuestions.map((q) => {
                      const correct = String(q.correctAnswer || q.answer || "");
                      const selected = String(quizAnswers[q.id] || "");
                      const options = Array.isArray(q.options) ? q.options : [];
                      const isCorrect = isQuizAnswerCorrect(selected, correct, options);
                      const correctDisplay = (() => {
                        const letter = /^[A-D]$/i.exec(correct);
                        if (letter) {
                          const idx = letter[0].toUpperCase().charCodeAt(0) - 65;
                          return options[idx] || correct;
                        }
                        return correct;
                      })();
                      return { q, correct: correctDisplay, selected, isCorrect };
                    });
                    const correctCount = reviewed.filter((r) => r.isCorrect).length;
                    const total = allQuestions.length || 1;
                    const scorePct = Math.round((correctCount / total) * 100);
                    const passed = correctCount / total >= PASS_MARK;
                    const hasNext = currentLessonIndex < lessons.length - 1;

                    const continueToNext = () => {
                      if (!currentLesson) return;
                      const lessonId = currentLesson.id;
                      setCompletedLessons((prev) => {
                        const next = new Set(prev);
                        next.add(lessonId);
                        return next;
                      });
                      if (!hasNext) return;
                      const nextIndex = currentLessonIndex + 1;
                      if (isPremiumLocked(nextIndex)) {
                        handleLessonClick(nextIndex);
                        return;
                      }
                      // Advance even when score is below the 50% pass mark
                      setCurrentLessonIndex(nextIndex);
                    };

                    return (
                      <div className="space-y-5 py-2">
                        <div className="text-center space-y-3">
                          <div className={cn(
                            "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border text-2xl shadow-xl",
                            passed
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-500"
                          )}>
                            {passed ? "🎓" : "📋"}
                          </div>
                          <h3 className="text-lg font-bold text-[var(--ib-ink)]">
                            {passed
                              ? t("academy.coursePlayer.congratulations", {
                                  defaultValue: "Congratulations! You Passed.",
                                })
                              : t("academy.coursePlayer.quizReviewed", {
                                  defaultValue: "Quiz reviewed — keep learning",
                                })}
                          </h3>
                          <p className="mx-auto max-w-md text-sm font-semibold text-[var(--ib-ink)]">
                            {t("academy.coursePlayer.performance")}: {correctCount}/{allQuestions.length} ({scorePct}%)
                            <span className="ml-2 text-[var(--ib-mute)]">
                              · {t("academy.coursePlayer.passMark", { defaultValue: "Pass mark" })}: 50%
                            </span>
                          </p>
                          <p className="mx-auto max-w-md text-xs text-[var(--ib-mute)]">
                            {passed
                              ? t("academy.coursePlayer.canProceed", {
                                  defaultValue: "You can now proceed to the next lesson.",
                                })
                              : t("academy.coursePlayer.belowPassContinue", {
                                  defaultValue:
                                    "You scored below 50%. Review the answers below — you can still continue to the next lesson.",
                                })}
                          </p>
                        </div>

                        <div className="space-y-3 text-left">
                          {reviewed.map(({ q, correct, selected, isCorrect }, idx) => (
                            <div
                              key={q.id || idx}
                              className={cn(
                                "rounded-xl border p-4",
                                isCorrect
                                  ? "border-emerald-500/25 bg-emerald-500/5"
                                  : "border-rose-500/25 bg-rose-500/5",
                              )}
                            >
                              <div className="mb-2 flex items-start gap-2">
                                {isCorrect ? (
                                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                ) : (
                                  <XCircle className="mt-0.5 size-4 shrink-0 text-rose-500" />
                                )}
                                <p className="text-sm font-bold text-[var(--ib-ink)]">
                                  {idx + 1}. {q.question}
                                </p>
                              </div>
                              <div className="ml-6 space-y-1 text-xs">
                                <p className={cn(isCorrect ? "text-emerald-700" : "text-rose-700")}>
                                  {t("academy.coursePlayer.yourAnswer", { defaultValue: "Your answer" })}:{" "}
                                  <span className="font-semibold">{selected || "—"}</span>
                                </p>
                                {!isCorrect ? (
                                  <p className="text-emerald-700">
                                    {t("academy.coursePlayer.correctAnswer", {
                                      defaultValue: "Correct answer",
                                    })}
                                    : <span className="font-semibold">{correct}</span>
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-col items-stretch justify-center gap-3 pt-1 sm:flex-row sm:items-center">
                          <button
                            type="button"
                            onClick={() => {
                              setQuizSubmitted(false);
                              setQuizAnswers({});
                              setCurrentQuestionIndex(0);
                            }}
                            className="rounded-xl border-2 border-[var(--ib-line)] bg-[var(--ib-card)] px-6 py-3 text-xs font-black uppercase tracking-wider text-[var(--ib-ink)] transition-all hover:border-[var(--ib-acc)] hover:bg-[var(--ib-accbg)]"
                          >
                            {t("academy.coursePlayer.tryAgain")}
                          </button>
                          {hasNext ? (
                            <button
                              type="button"
                              onClick={continueToNext}
                              className="rounded-xl bg-[var(--ib-acc)] px-8 py-3 text-xs font-black uppercase tracking-wider text-white shadow-[0_12px_28px_-12px_color-mix(in_srgb,var(--ib-acc)_65%,transparent)] transition-all hover:opacity-92"
                            >
                              {t("academy.coursePlayer.nextModule")} →
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (currentLesson) {
                                  setCompletedLessons((prev) => new Set(prev).add(currentLesson.id));
                                }
                              }}
                              className="rounded-xl bg-emerald-500 px-8 py-3 text-xs font-black uppercase tracking-wider text-white transition-all hover:opacity-92"
                            >
                              {t("academy.coursePlayer.courseComplete", {
                                defaultValue: "Mark course progress complete",
                              })}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  const q = allQuestions[currentQuestionIndex];
                  if (!q) return null;
                  const isLast = currentQuestionIndex === allQuestions.length - 1;
                  const isAnswered = !!quizAnswers[q.id];
                  const allAnswered = allQuestions.every((item) => !!quizAnswers[item.id]);

                  return (
                    <div className="space-y-6">
                      <div className="flex gap-1.5">
                        {allQuestions.map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-1.5 flex-1 rounded-full transition-all duration-300",
                              i < currentQuestionIndex ? "bg-[var(--ib-acc)]" : i === currentQuestionIndex ? "bg-[var(--ib-acc)]/60" : "bg-[var(--ib-accbg)]"
                            )}
                          />
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-black text-[var(--ib-acc)] uppercase tracking-wider">
                        <span>{t('academy.coursePlayer.protocolEvaluation')}: {currentQuestionIndex + 1} / {allQuestions.length}</span>
                      </div>

                      <p className="text-sm md:text-base font-bold text-[var(--ib-ink)] leading-relaxed">{q.question}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((opt) => {
                          const isSelected = quizAnswers[q.id] === opt;
                          return (
                            <label
                              key={opt}
                              className={cn(
                                "flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all",
                                isSelected ? "border-[var(--ib-acc)] bg-[var(--ib-acc)]/10 text-[var(--ib-ink)]" : "border-[var(--ib-line)] bg-[var(--ib-bg)] text-[var(--ib-mute)] hover:border-[var(--ib-line)]"
                              )}
                            >
                              <span className={cn(
                                "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all",
                                isSelected ? "border-white" : "border-[var(--ib-line)] bg-transparent"
                              )}>
                                {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-white" />}
                              </span>
                              <input
                                type="radio"
                                name={q.id}
                                value={opt}
                                checked={isSelected}
                                onChange={() => handleQuizChange(q.id, opt)}
                                className="sr-only"
                              />
                              <span className="text-xs md:text-sm font-medium">{opt}</span>
                            </label>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
                          disabled={currentQuestionIndex === 0}
                          className="px-4 py-2 rounded-lg border border-[var(--ib-line)] text-xs font-bold text-[var(--ib-ink)] hover:bg-[var(--ib-accbg)] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                          ← {t('isoNavigator.back')}
                        </button>

                        {isLast ? (
                          <button
                            type="button"
                            onClick={handleSubmitQuiz}
                            disabled={!allAnswered}
                            className="rounded-xl bg-[var(--ib-acc)] px-7 py-3 text-xs font-black uppercase tracking-wider text-white shadow-[0_12px_28px_-12px_color-mix(in_srgb,var(--ib-acc)_65%,transparent)] transition-all hover:opacity-92 disabled:cursor-not-allowed disabled:bg-[var(--ib-accbg)] disabled:text-[var(--ib-ink)]/40 disabled:shadow-none"
                          >
                            {t("academy.coursePlayer.submitAssessment", {
                              defaultValue: "Submit Assessment",
                            })}{" "}
                            ✓
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCurrentQuestionIndex((i) => Math.min(allQuestions.length - 1, i + 1))}
                            disabled={!isAnswered}
                            className="rounded-xl bg-[var(--ib-acc)] px-7 py-3 text-xs font-black uppercase tracking-wider text-white shadow-[0_12px_28px_-12px_color-mix(in_srgb,var(--ib-acc)_65%,transparent)] transition-all hover:opacity-92 disabled:cursor-not-allowed disabled:bg-[var(--ib-accbg)] disabled:text-[var(--ib-ink)]/40 disabled:shadow-none"
                          >
                            {t("dynamic.dyn_next_497") || "Next"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
