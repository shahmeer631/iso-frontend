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

  // Fetch course data by ID from /courses/:id
  const courseId = resolvedParams?.id ?? "";
  const { data: courseData, isLoading, isError, error: courseError } = useGetCourseByIdQuery(courseId, {
    skip: !courseId || !isAccessVerified,
  });

  const course = courseData?.data;
  const lessons = course?.lessons?.slice().sort((a, b) => a.order - b.order) ?? [];

  // Handle errors from course data fetch
  React.useEffect(() => {
    if (courseError) {
      const err = courseError as any;
      if (err?.status === 403 || err?.data?.statusCode === 403 || err?.data?.message?.includes("Upgrade your plan")) {
        toast.error(err?.data?.message || t('isoNavigator.upgradeUltra'));
        const lang = resolvedParams?.lang || "en";
        router.push(`/${lang}/pricing?courseId=${courseId}`);
      }
    }
  }, [courseError, router, courseId, resolvedParams?.lang, t]);

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
  const [aiMessages, setAiMessages] = React.useState<{ role: "user" | "ai"; text: string; followups?: string[] }[]>([]);
  const [chatSessionId] = React.useState(() => `session_${Date.now()}`);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const isUserScrolledUp = React.useRef(false);
  const lastChatScrollTop = React.useRef(0);
  const [sendAiChat, { isLoading: isChatLoading }] = useAcademyChatBotMutation();
  const [createNote, { isLoading: isSavingNote }] = useCreateNoteMutation();
  const [isNoteOpen, setIsNoteOpen] = React.useState(false);
  const [noteContent, setNoteContent] = React.useState("");
  const [savedNotes, setSavedNotes] = React.useState<{ content: string; createdAt: string }[]>([]);

  // Access verification
  React.useEffect(() => {
    if (!resolvedParams?.id) return;
    setIsVerifying(true);

    const timer = setTimeout(async () => {
      let activeCourseId = resolvedParams.id;
      const lang = resolvedParams.lang || "en";

      let activeToken = token;
      if (!activeToken && typeof document !== "undefined") {
        const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
        if (match) activeToken = match[2];
      }

      if (!activeToken) {
        router.push(`/${lang}/auth/login?courseId=${activeCourseId}`);
        setIsVerifying(false);
        return;
      }

      try {
        const result = await checkEnrollment({ courseId: activeCourseId }).unwrap();
        const isEnrolled =
          result?.success === true ||
          result?.enrolled ||
          result?.isEnrolled ||
          result?.isPurchased ||
          result?.data?.enrolled ||
          result?.data?.isEnrolled ||
          result?.data?.isPurchased ||
          !!result?.data?.id;

        if (isEnrolled) {
          setIsAccessVerified(true);
        } else {
          router.push(`/${lang}/pricing?courseId=${activeCourseId}`);
        }
      } catch (error: any) {
        if (error?.status === 403 || error?.data?.statusCode === 403 || error?.data?.message?.includes("Upgrade your plan")) {
          toast.error(error?.data?.message || "Upgrade your plan to access courses");
          router.push(`/${lang}/pricing?courseId=${activeCourseId}`);
        } else if (error?.data?.message === "Already enrolled" || error?.status === 400) {
          setIsAccessVerified(true);
        } else {
          router.push(`/${lang}/pricing?courseId=${activeCourseId}`);
        }
      } finally {
        setIsVerifying(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [resolvedParams?.id, token, router, checkEnrollment, resolvedParams?.lang]);

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

  const isLessonUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevLesson = lessons[index - 1];
    return prevLesson ? completedLessons.has(prevLesson.id) : false;
  };

  const handleLessonClick = (index: number) => {
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

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
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
      const response = await sendAiChat({
        question: userText,
        courseId: courseData?.data?.isoStandard?.id,
        sessionId: chatSessionId,
      }).unwrap();

      const aiText = response?.data?.answer || "I could not generate an answer at this time.";
      setAiMessages((prev) => [...prev, { role: "ai", text: aiText }]);
      setTimeout(() => scrollToBottom(true), 100);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        { role: "ai", text: "Encountered a connection error. Please verify your query and retry." },
      ]);
    }
  };

  // ─── Loading / Error states ───────────────────────────────────────────────

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center font-inter">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-cyan border-t-transparent" />
          <p className="text-[#A0AAB2] font-medium">{t('academy.coursePlayer.verifyingAccess')}</p>
        </div>
      </div>
    );
  }

  if (!isAccessVerified) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center font-inter">
        <div className="flex flex-col items-center gap-4">
          <p className="text-[#A0AAB2] font-medium">{t('academy.coursePlayer.loadingContent')}</p>
        </div>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-6 font-inter">
        <div className="max-w-md bg-[#161B22] p-8 rounded-2xl shadow-sm border border-white/10 text-center">
          <h2 className="text-xl font-bold text-white mb-2">{t('academy.coursePlayer.somethingWentWrong')}</h2>
          <p className="text-[#A0AAB2] mb-6">{t('academy.coursePlayer.couldNotLoadCourse')}</p>
          <Button onClick={() => window.location.reload()} className="bg-brand-cyan text-[#0F111A] px-8 py-2 rounded-lg font-bold">
            {t('academy.coursePlayer.retry')}
          </Button>
        </div>
      </div>
    );
  }

  // ─── Main Render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0B0F19] font-inter text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-[#00f0ff]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[600px] h-[600px] bg-[#00f0ff]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto px-4 pt-24 pb-12 sm:px-6 lg:px-8 relative z-10 max-w-[1800px]">
        {/* ── Top Header Bar (Breadcrumb & Course Meta) ── */}
        <div className="mb-6 bg-[#161B22]/90 backdrop-blur-md rounded-2xl border border-white/10 p-5 md:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <Link
                href={`${basePath}/academy`}
                className="inline-flex items-center gap-2 text-xs md:text-sm text-brand-cyan font-bold hover:opacity-80 transition-all uppercase tracking-wider"
              >
                <ChevronLeft className="h-4 w-4" />
                {t('academy.coursePlayer.courseCatalog')}
              </Link>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight">{course.title}</h1>
              <div className="flex items-center gap-3 text-xs text-[#A0AAB2] flex-wrap">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                  {t('academy.coursePlayer.instructor')}: <span className="text-white font-semibold">{course.instructor}</span>
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                  {course.cpdHours} {t('academy.coursePlayer.cpdHours')}
                </span>
                {course.category?.name && (
                  <span className="px-2.5 py-1 rounded-md bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan font-medium">
                    {course.category.name}
                  </span>
                )}
              </div>
            </div>

            {/* Mobile / Tablet Toggle Button for Curriculum (3rd Image) */}
            <div className="xl:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMobileCurriculumOpen(!isMobileCurriculumOpen)}
                className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan font-bold text-xs uppercase tracking-wider hover:bg-brand-cyan/20 transition-all"
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
            <div className="xl:hidden mt-4 pt-4 border-t border-white/10">
              <div className="bg-[#0B0F19] rounded-2xl border border-white/10 p-4 max-h-[60vh] overflow-y-auto space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">{t('academy.coursePlayer.curriculum')}</h3>
                  <span className="text-xs text-brand-cyan font-bold">{completedCount}/{totalLessons} {t('academy.coursePlayer.modulesCompleted')}</span>
                </div>
                <ul className="space-y-2">
                  {lessons.map((lesson, index) => {
                    const isActive = currentLessonIndex === index;
                    const isCompleted = completedLessons.has(lesson.id);
                    const isUnlocked = isLessonUnlocked(index);
                    const hasQuiz = lesson.quizzes?.some((q) => q.questions?.length > 0);

                    return (
                      <li key={lesson.id}>
                        <button
                          type="button"
                          onClick={() => {
                            handleLessonClick(index);
                            setIsMobileCurriculumOpen(false);
                          }}
                          disabled={!isUnlocked}
                          className={cn(
                            "w-full flex items-start gap-3 rounded-xl border p-3 text-left transition-all duration-300",
                            !isUnlocked && "cursor-not-allowed border-white/5 bg-white/2 opacity-30",
                            isUnlocked && "hover:border-white/20 hover:bg-white/5",
                            isCompleted && !isActive && "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10",
                            isActive && "border-brand-cyan bg-brand-cyan/10 shadow-[0_0_15px_rgba(0,240,255,0.1)]",
                            !isCompleted && !isActive && isUnlocked && "border-white/10 bg-[#161B22]"
                          )}
                        >
                          <span className="mt-0.5 shrink-0 text-base text-[#00F0FF]">
                            {!isUnlocked ? "🔒" : isCompleted && !isActive ? "✅" : isActive ? "▶️" : "⏯️"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className={cn(
                              "text-xs md:text-sm font-bold tracking-tight",
                              isActive && "text-[#00F0FF]",
                              isCompleted && !isActive && "text-emerald-400",
                              !isUnlocked && "text-[#4B5563]",
                              isUnlocked && !isActive && !isCompleted && "text-white/90"
                            )}>
                              {lesson.title}
                            </p>
                            <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#A0AAB2]/60">
                              {lesson.video?.duration || "Modular"}
                              {hasQuiz && " · 📝 Assessment"}
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

        {/* ── Main Layout: Desktop Sidebar + Equal Video & AI Grid ── */}
        <div className="flex flex-col xl:flex-row items-start gap-6">

          {/* ── 1. Desktop Left Sidebar: Modules & Curriculum ── */}
          <div className={cn(
            "hidden xl:block shrink-0 sticky top-24 max-h-[calc(100vh-8rem)] transition-all duration-300 ease-in-out",
            isSidebarCollapsed ? "w-[60px]" : "w-[280px]"
          )}>
            <div className="bg-[#161B22] rounded-2xl border border-white/10 p-3.5 shadow-2xl max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar">
              <div className={cn("flex items-center pb-3 border-b border-white/10", isSidebarCollapsed ? "justify-center" : "justify-between")}>
                {!isSidebarCollapsed && (
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    {t('academy.coursePlayer.curriculum')}
                  </h3>
                )}
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className={cn(
                    "p-1.5 text-white/70 hover:text-white transition-all rounded-lg hover:bg-white/5",
                    isSidebarCollapsed ? "w-full flex justify-center text-brand-cyan" : "ml-auto"
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
                    className="p-2.5 rounded-xl bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan transition-all shadow-sm"
                    title="Open Curriculum"
                  >
                    <PlayCircle className="h-5 w-5" />
                  </button>
                  <span className="text-[10px] font-black text-brand-cyan [writing-mode:vertical-lr] tracking-[0.2em] uppercase">
                    {t('academy.coursePlayer.curriculum')}
                  </span>
                </div>
              )}

              {!isSidebarCollapsed && (
                <ul className="space-y-3">
                  {lessons.map((lesson, index) => {
                    const isActive = currentLessonIndex === index;
                    const isCompleted = completedLessons.has(lesson.id);
                    const isUnlocked = isLessonUnlocked(index);
                    const hasQuiz = lesson.quizzes?.some((q) => q.questions?.length > 0);

                    return (
                      <li key={lesson.id}>
                        <button
                          type="button"
                          onClick={() => handleLessonClick(index)}
                          disabled={!isUnlocked}
                          className={cn(
                            "w-full flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-300",
                            !isUnlocked && "cursor-not-allowed border-white/5 bg-white/2 opacity-30",
                            isUnlocked && "hover:border-white/20 hover:bg-white/5",
                            isCompleted && !isActive && "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10",
                            isActive && "border-brand-cyan bg-brand-cyan/10 shadow-[0_0_15px_rgba(0,240,255,0.1)]",
                            !isCompleted && !isActive && isUnlocked && "border-white/10 bg-[#1C222B]"
                          )}
                        >
                          <span className="mt-0.5 shrink-0 text-base text-[#00F0FF]">
                            {!isUnlocked ? "🔒" : isCompleted && !isActive ? "✅" : isActive ? "▶️" : "⏯️"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className={cn(
                              "text-xs font-bold tracking-tight line-clamp-2",
                              isActive && "text-[#00F0FF]",
                              isCompleted && !isActive && "text-emerald-400",
                              !isUnlocked && "text-[#4B5563]",
                              isUnlocked && !isActive && !isCompleted && "text-white/90"
                            )}>
                              {lesson.title}
                            </p>
                            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-[#A0AAB2]/60">
                              {lesson.video?.duration || "Modular"}
                              {hasQuiz && " · 📝 Assessment"}
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
                className="mt-4 block w-full rounded-xl bg-emerald-500 px-4 py-3 text-center text-xs font-black text-[#0B0F19] uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:opacity-90 transition-all"
              >
                🎓 {t('academy.coursePlayer.finalExam')}
              </Link>
            )}
          </div>

          {/* ── Main Content Area: Video (50%) & Ask AI (50%) Side by Side ── */}
          <div className="w-full flex-1 min-w-0 space-y-6">

            {/* Top Row: Video Player + Ask AI Chatbot in Equal 50/50 Proportions */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">

              {/* Left Card: Video Player */}
              <div className="flex flex-col rounded-2xl bg-[#161B22] border border-white/10 overflow-hidden shadow-2xl">
                <div className="overflow-hidden bg-[#000000] aspect-video w-full flex items-center justify-center">
                  {videoSrc && !videoSrc.includes('youtube.com') && !videoSrc.includes('youtu.be') && !videoSrc.includes('vimeo.com') ? (
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
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[#0B0F19]">
                          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-3 border border-white/10 shadow-xl">
                            <XCircle className="w-7 h-7 text-white/30" />
                          </div>
                          <h3 className="text-base md:text-lg font-bold text-white mb-1">{t('academy.coursePlayer.noVideoFound')}</h3>
                          <p className="text-[#A0AAB2] text-xs max-w-xs mx-auto">
                            {currentLesson
                              ? t('academy.coursePlayer.noVideoDesc')
                              : t('academy.coursePlayer.selectToStart')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="px-5 py-3.5 bg-[#161B22] border-t border-white/5 flex items-center justify-between mt-auto">
                  <div className="min-w-0 pr-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-cyan mb-0.5">{t('academy.coursePlayer.nowStreaming')}</p>
                    <p className="text-sm font-bold text-white/90 truncate">{currentVideo?.title || t('academy.coursePlayer.selectLesson')}</p>
                  </div>
                  <PlayCircle className="w-5 h-5 text-brand-cyan opacity-60 shrink-0" />
                </div>
              </div>

              {/* Right Card: Ask AI About This Lesson (Equal Width & Height Match) */}
              <div className="flex flex-col rounded-2xl bg-[#161B22] border border-white/10 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-brand-cyan/10 to-transparent border-b border-white/10 shrink-0">
                  <div className="p-2 bg-brand-cyan text-[#0F111A] rounded-xl font-bold">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-wider">{t('academy.coursePlayer.askAI')} ✨</h2>
                    <p className="text-[10px] font-bold text-brand-cyan uppercase tracking-[0.2em]">{t('academy.coursePlayer.neuralEngine')}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full">
                    <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse" />
                    <span className="text-[10px] font-black text-[#A0AAB2] uppercase tracking-widest">{t('academy.coursePlayer.active')}</span>
                  </div>
                </div>

                {/* Chat messages */}
                <div
                  ref={chatContainerRef}
                  onScroll={handleChatScroll}
                  className="flex-1 min-h-[300px] max-h-[380px] overflow-y-auto p-4 space-y-4 bg-[#0B0F19]/40 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  {aiMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-brand-cyan shadow-lg">
                        <MessageCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm md:text-base font-bold text-white mb-1">{t('academy.coursePlayer.knowledgeSynthesis')}</p>
                        <p className="text-xs text-[#A0AAB2] max-w-xs mx-auto leading-relaxed">{t('academy.coursePlayer.askClarify')}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1 justify-center">
                        {[t('academy.coursePlayer.clarifyConcepts'), t('academy.coursePlayer.synthesizeSummary'), t('academy.coursePlayer.implementationPitfalls')].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setAiQuestion(s)}
                            className="text-[10px] font-bold px-3 py-1 rounded-full border border-white/10 text-[#A0AAB2] hover:text-white hover:bg-brand-cyan/20 hover:border-brand-cyan/40 transition-all"
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
                              ? "max-w-[85%] bg-brand-cyan/15 text-white border border-brand-cyan/30 rounded-tr-sm"
                              : "w-full bg-[#1C222B] border border-white/5 text-[#EDEDED] rounded-tl-sm shadow-lg"
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
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex gap-2 justify-start">
                          <div className="bg-[#1C222B] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-md flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-brand-cyan animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="h-2 w-2 rounded-full bg-brand-cyan animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="h-2 w-2 rounded-full bg-brand-cyan animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-3.5 border-t border-white/5 bg-[#161B22] flex gap-2 shrink-0">
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !isChatLoading && handleSendAi()}
                    disabled={isChatLoading}
                    placeholder={t('academy.coursePlayer.queryAIArchitect')}
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0B0F19] px-4 py-2.5 text-xs md:text-sm text-white placeholder:text-[#4B5563] focus:border-brand-cyan/50 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleSendAi}
                    disabled={!aiQuestion.trim() || isChatLoading}
                    className="flex shrink-0 items-center justify-center rounded-xl bg-brand-cyan text-[#0F111A] px-3.5 py-2.5 hover:opacity-90 transition-all disabled:opacity-20"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Progress bar */}
            <div className="bg-[#161B22] rounded-2xl border border-white/10 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A0AAB2] font-medium uppercase tracking-widest">
                  {completedCount} {t('academy.coursePlayer.of')} {totalLessons} {t('academy.coursePlayer.modulesCompleted')}
                </span>
                <span className="text-brand-cyan font-black">{Math.round(totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/5 border border-white/10">
                <div
                  className="h-full rounded-full bg-brand-cyan transition-all duration-700 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                  style={{ width: `${totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Lesson Knowledge Check / Quiz */}
            {allQuestions.length > 0 && (
              <div className="rounded-2xl bg-[#161B22] border border-white/10 p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div className="p-2.5 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan">
                    📝
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white uppercase tracking-wider">{t('academy.coursePlayer.lessonKnowledgeCheck')}</h2>
                    <p className="text-xs text-[#A0AAB2] mt-0.5">{t('academy.coursePlayer.quizTrigger')}</p>
                  </div>
                </div>

                {/* Quiz Content */}
                {(() => {
                  if (quizSubmitted) {
                    let correctCount = 0;
                    allQuestions.forEach((q) => {
                      const correct = q.correctAnswer || q.answer;
                      if (quizAnswers[q.id] === correct) correctCount++;
                    });
                    const passed = correctCount === allQuestions.length;

                    return (
                      <div className="text-center py-6 space-y-4">
                        <div className={cn(
                          "w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border text-2xl shadow-xl",
                          passed ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
                        )}>
                          {passed ? "🎓" : "⚠️"}
                        </div>
                        <h3 className="text-lg font-bold text-white">
                          {passed ? t('academy.coursePlayer.strategicMastery') : `${t('academy.coursePlayer.performance')}: ${correctCount}/${allQuestions.length}`}
                        </h3>
                        <p className="text-xs text-[#A0AAB2] max-w-sm mx-auto">
                          {passed ? t('academy.coursePlayer.flawlessExecution') : t('academy.coursePlayer.knowledgeGapDetected')}
                        </p>
                        <div className="pt-2 flex justify-center gap-3">
                          {!passed ? (
                            <button
                              type="button"
                              onClick={() => {
                                setQuizSubmitted(false);
                                setQuizAnswers({});
                                setCurrentQuestionIndex(0);
                              }}
                              className="px-6 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-all uppercase tracking-wider"
                            >
                              {t('academy.coursePlayer.tryAgain')}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (currentLesson) {
                                  setCompletedLessons((prev) => new Set(prev).add(currentLesson.id));
                                }
                                if (currentLessonIndex < lessons.length - 1) {
                                  handleLessonClick(currentLessonIndex + 1);
                                }
                              }}
                              className="px-6 py-2.5 rounded-xl bg-brand-cyan text-[#0F111A] font-black text-xs hover:opacity-90 transition-all uppercase tracking-wider"
                            >
                              {t('academy.coursePlayer.nextModule')} →
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
                              i < currentQuestionIndex ? "bg-brand-cyan" : i === currentQuestionIndex ? "bg-brand-cyan/60" : "bg-white/10"
                            )}
                          />
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-black text-brand-cyan uppercase tracking-wider">
                        <span>{t('academy.coursePlayer.protocolEvaluation')}: {currentQuestionIndex + 1} / {allQuestions.length}</span>
                      </div>

                      <p className="text-sm md:text-base font-bold text-white leading-relaxed">{q.question}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((opt) => {
                          const isSelected = quizAnswers[q.id] === opt;
                          return (
                            <label
                              key={opt}
                              className={cn(
                                "flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all",
                                isSelected ? "border-brand-cyan bg-brand-cyan/10 text-white" : "border-white/10 bg-[#0B0F19] text-[#A0AAB2] hover:border-white/20"
                              )}
                            >
                              <span className={cn(
                                "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all",
                                isSelected ? "border-white" : "border-white/30 bg-transparent"
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
                          className="px-4 py-2 rounded-lg border border-white/10 text-xs font-bold text-white hover:bg-white/5 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                          ← {t('isoNavigator.back')}
                        </button>

                        {isLast ? (
                          <button
                            type="button"
                            onClick={handleSubmitQuiz}
                            disabled={!allAnswered}
                            className="px-6 py-2 rounded-lg bg-brand-cyan text-white text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed"
                          >
                            {t('academy.coursePlayer.validateProtocol')} ✓
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCurrentQuestionIndex((i) => Math.min(allQuestions.length - 1, i + 1))}
                            disabled={!isAnswered}
                            className="px-6 py-2 rounded-lg bg-brand-cyan text-white text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed"
                          >
                            {t('dynamic.dyn_next_497') || 'Next'}
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
