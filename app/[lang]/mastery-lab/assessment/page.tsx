"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Trophy,
  Zap,
  Target,
  ShieldAlert,
  Brain,
  ListChecks,
  BookOpen,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Info,
  Check,
  Award,
  ExternalLink,
  Book,
  GraduationCap,
  Sparkles,
  BarChart3,
  AlertCircle,
  Quote
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

import ExploreFeatures from "@/components/Shared/ExploreFeatures";
import { useSubmitAssessmentMutation, type SubmitAssessmentResponse } from "@/lib/redux/api/isoStandardsApi";
import { useGenerateQuizMutation } from "@/lib/redux/api/quizApi";
import { useSelector } from "react-redux";
import { selectCurrentToken, selectCurrentUser } from "@/lib/redux/features/auth/authSlice";
import FullPageLoader from "@/components/Shared/FullPageLoader";
import {
  MASTERY_QUIZ_DIFFICULTY,
  transformQuizQuestions,
} from "@/lib/mastery/normalizeQuizOptions";
import {
  Question,
  SelectedAnswers,
  ResultCard,
  QuestionCard,
  HintModal,
  Timer,
  ProgressBar as QuizProgressBar,

} from "@/components/assessment";

import { AchievementBadge } from "@/components/assessment/AchievementBadge";
import Leaderboard from '@/components/assessment/Leaderboard';
import { SkillHexGrid } from "@/components/assessment/SkillHexGrid";
import EvaluationProgressBar from "@/components/mastery-lab/evaluation/ProgressBar";

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What are the key components of an ISO 9001 Quality Management System?",
    options: [
      { label: "A", text: "Sample answer option A" },
      { label: "B", text: "Sample answer option B" },
      { label: "C", text: "Sample answer option C" },
      { label: "D", text: "Sample answer option D" },
    ],
    correctAnswer: "B",
    hint: "Based on ISO 9001 standards, the correct answer typically involves understanding the core principles of quality management systems.",
    hintInsight: 'Options that include terms like "documented procedures," "risk assessment," or "leadership commitment" are often aligned.',
    explanation: "The key components include leadership commitment, risk-based thinking, process approach, and continual improvement.",
  },
];

const STORAGE_KEY = "iso_assessment_progress";
const INITIAL_TIME = 15 * 60;

const AssessmentQuizPage = () => {
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();

  const [submitAssessment, { isLoading: isSubmitting }] = useSubmitAssessmentMutation();
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);

  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState(t('mastery.assessmentTitle'));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [showHint, setShowHint] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(INITIAL_TIME);
  const [showResults, setShowResults] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [assessmentData, setAssessmentData] = useState<SubmitAssessmentResponse['data'] | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [guestId, setGuestId] = useState<string>("");
  const [hasTriggeredTen, setHasTriggeredTen] = useState(false);
  const [hasTriggeredTwenty, setHasTriggeredTwenty] = useState(false);
  const [generateQuiz] = useGenerateQuizMutation();
  const [quizMetadata, setQuizMetadata] = useState<any>(null);
  const [examSessionIds, setExamSessionIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && !token) {
      let gId = localStorage.getItem("iso_guest_id");
      if (!gId) {
        gId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        localStorage.setItem("iso_guest_id", gId);
      }
      setGuestId(gId);
    }
  }, [token]);

  useEffect(() => {
    const activeQuiz = localStorage.getItem("active_iso_quiz");

    if (activeQuiz) {
      try {
        const parsedQuiz = JSON.parse(activeQuiz);
        if (parsedQuiz.questions && parsedQuiz.questions.length > 0) {
          setQuizQuestions(parsedQuiz.questions);
          setQuizTitle(parsedQuiz.title || t("mastery.assessmentTitle"));
          setCategoryId(parsedQuiz.categoryId || "");
          setExamSessionIds(
            Array.isArray(parsedQuiz.examSessionIds)
              ? parsedQuiz.examSessionIds.map(String)
              : parsedQuiz.examSessionId
                ? [String(parsedQuiz.examSessionId)]
                : []
          );
          setQuizMetadata({
            categoryId: parsedQuiz.categoryId,
            categoryName: parsedQuiz.categoryName,
            difficulty: parsedQuiz.difficulty,
            jobFunction: parsedQuiz.jobFunction,
          });

          if (parsedQuiz.questions.length >= 20) setHasTriggeredTen(true);
          if (parsedQuiz.questions.length >= 30) setHasTriggeredTwenty(true);
        }
      } catch (e) {
        console.error("Failed to parse active quiz", e);
      }
    }

    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      try {
        const {
          currentQuestion: savedQ,
          selectedAnswers: savedAnswers,
          timeRemaining: savedTime,
          showResults: savedShowResults,
        } = JSON.parse(savedProgress);
        setCurrentQuestion(savedQ || 0);
        setSelectedAnswers(savedAnswers || {});
        setTimeRemaining(
          typeof savedTime === "number" && savedTime > 0
            ? savedTime
            : INITIAL_TIME
        );
        setShowResults(savedShowResults || false);
      } catch (e) {
        console.error("Failed to parse progress", e);
      }
    }
    setIsLoaded(true);
  }, [t]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          currentQuestion,
          selectedAnswers,
          timeRemaining,
          showResults,
        }),
      );
    }
  }, [currentQuestion, selectedAnswers, timeRemaining, showResults, isLoaded]);

  useEffect(() => {
    if (showResults) return;

    if (timeRemaining <= 0) {
      toast.error(t('mastery.timeOver'));
      localStorage.removeItem(STORAGE_KEY);
      const currentLang = params?.lang || 'en';
      router.push(`/${currentLang}/mastery-lab`);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [showResults, timeRemaining, router, params?.lang]);

  useEffect(() => {
    if (isLoaded && quizMetadata && !showResults) {
      // Fetch 2nd batch (11-20) when we have the initial 10
      if (quizQuestions.length <= 10 && !hasTriggeredTen) {
        setHasTriggeredTen(true);
        loadMoreQuestions(10);
      }
      // Fetch 3rd batch (21-30) as soon as the 2nd batch is loaded (length reaches 20)
      else if (quizQuestions.length > 10 && quizQuestions.length <= 20 && !hasTriggeredTwenty) {
        setHasTriggeredTwenty(true);
        loadMoreQuestions(10);
      }
    }
  }, [isLoaded, quizMetadata, quizQuestions.length, hasTriggeredTen, hasTriggeredTwenty, showResults]);

  const calculateCounts = (answers: SelectedAnswers = selectedAnswers) => {
    const rightAns = quizQuestions.filter((q, idx) => {
      return answers[idx] === q.correctAnswer;
    }).length;
    const total = quizQuestions.length;
    const wrongAns = total - rightAns;
    return { rightAns, wrongAns, total };
  };

  const advanceAfterAnswer = async (answers: SelectedAnswers) => {
    try {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion((q) => q + 1);
        setIsAdvancing(false);
        return;
      }

      if (quizQuestions.length < 30) {
        toast.info(
          t(
            "mastery.loadingMore",
            "Loading more questions, please wait a moment..."
          )
        );
        setIsAdvancing(false);
        return;
      }

      const { rightAns, wrongAns } = calculateCounts(answers);
      const timeTaken = INITIAL_TIME - timeRemaining;
      const answersPayload = quizQuestions.map((q, idx) => ({
        questionId: (q as any).questionId,
        question: q.question,
        selected_answer: answers[idx] || "",
        // correct_answer retained for backward compatibility only — server ignores it
        correct_answer: q.correctAnswer,
      }));

      if (!examSessionIds.length) {
        toast.error(
          t(
            "mastery.missingExamSession",
            "Assessment session expired. Please restart the assessment."
          )
        );
        setIsAdvancing(false);
        return;
      }

      const response = await submitAssessment({
        userId: user?.id || null,
        guestId: !token ? guestId : undefined,
        examSessionIds,
        timeTaken,
        metadata: {
          industry: quizMetadata?.categoryName || "General",
          management_level: quizMetadata?.difficulty || "Manager",
          department: quizMetadata?.jobFunction || "Operation",
          suggestedStandards: quizMetadata?.categoryName
            ? [quizMetadata.categoryName]
            : ["ISO 9001"],
        },
        answers: answersPayload,
      }).unwrap();

      if (response) {
        const dataToSave = response.data || response;
        const resultWithCounts = {
          ...dataToSave,
          rightAns,
          wrongAns,
        };
        setAssessmentData(resultWithCounts);
        localStorage.setItem(
          "active_iso_assessment_result",
          JSON.stringify(resultWithCounts)
        );
      }
      setShowResults(true);
      setCurrentQuestion(0);
    } catch (error: any) {
      const apiMessage =
        error?.data?.message ||
        error?.data?.errorSources?.[0]?.message ||
        error?.error ||
        error?.message ||
        null;
      console.error(
        "Critical error in submitAssessment:",
        apiMessage || error?.status || "unknown",
        error?.data || error
      );
      const isUnauthorized =
        error?.status === 401 ||
        error?.data?.statusCode === 401 ||
        String(apiMessage || "")
          .toLowerCase()
          .includes("unauthorized");

      if (isUnauthorized) {
        toast.error(
          t("auth.loginRequired", "Please sign in to submit your assessment.")
        );
        const currentLang = params?.lang || "en";
        const fromPath = `/${currentLang}/mastery-lab/assessment`;
        router.push(
          `/${currentLang}/auth/login?from=${encodeURIComponent(fromPath)}`
        );
        return;
      }

      toast.error(
        typeof apiMessage === "string" && apiMessage
          ? apiMessage
          : t(
              "mastery.submitFailed",
              "Could not submit assessment. Please try again."
            )
      );
      // Stay on assessment so the user can retry after a recoverable claim/server error
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleAnswerSelect = (label: string) => {
    if (showResults || isAdvancing || isSubmitting) return;

    const questionIndex = currentQuestion;
    const nextAnswers = { ...selectedAnswers, [questionIndex]: label };
    setSelectedAnswers(nextAnswers);

    try {
      const q = quizQuestions[questionIndex];
      const selectedOptionText =
        q?.options?.find((o) => o.label === label)?.text || "";
      const answerRecord = {
        questionIndex,
        questionText: q?.question || "",
        selectedOption: label,
        optionText: selectedOptionText,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem("last_selected_option", JSON.stringify(answerRecord));

      const existingAnswers = JSON.parse(
        localStorage.getItem("all_selected_answers") || "[]"
      );
      const updatedAnswers = existingAnswers.filter(
        (item: any) => item.questionIndex !== questionIndex
      );
      updatedAnswers.push(answerRecord);
      updatedAnswers.sort(
        (a: any, b: any) => a.questionIndex - b.questionIndex
      );
      localStorage.setItem(
        "all_selected_answers",
        JSON.stringify(updatedAnswers)
      );
    } catch (e) {
      console.error("Failed to save answer to local storage", e);
    }

    // Keep selected highlight visible briefly, then advance with the recorded answers
    setIsAdvancing(true);
    window.setTimeout(() => {
      void advanceAfterAnswer(nextAnswers);
    }, 650);
  };

  const loadMoreQuestions = async (count: number = 10) => {
    if (!quizMetadata) return;

    try {
      const res = await generateQuiz({
        context: {
          industry: quizMetadata.categoryName || "",
          management_level: quizMetadata.difficulty || "Manager",
          department: quizMetadata.jobFunction || "Operation"
        },
        num_questions: count,
        difficulty: MASTERY_QUIZ_DIFFICULTY
      }).unwrap();

      const quizData = res.data || res;
      const extraQuestionsRaw = quizData.questions || [];

      if (extraQuestionsRaw.length > 0) {
        const transformedExtra = transformQuizQuestions(
          extraQuestionsRaw,
          quizQuestions.length + 1
        );
        const newSessionId = quizData.examSessionId
          ? String(quizData.examSessionId)
          : null;

        setExamSessionIds((prev) => {
          const next = newSessionId && !prev.includes(newSessionId)
            ? [...prev, newSessionId]
            : prev;
          setQuizQuestions((qPrev) => {
            const combined = [...qPrev, ...transformedExtra].slice(0, 30);
            const activeQuiz = localStorage.getItem("active_iso_quiz");
            if (activeQuiz) {
              try {
                const parsed = JSON.parse(activeQuiz);
                parsed.questions = combined;
                parsed.examSessionIds = next;
                localStorage.setItem("active_iso_quiz", JSON.stringify(parsed));
              } catch (e) { }
            }
            return combined;
          });
          return next;
        });
      }
    } catch (error) {
      console.error("Failed to load additional Mastery Lab questions:", error);
    }
  };

  const handleNext = async () => {
    if (showResults) {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        const { rightAns, wrongAns } = calculateCounts();
        const score = Math.round((rightAns / (rightAns + wrongAns)) * 100);
        // Explicitly save the results for the success-evaluation page
        localStorage.setItem(
          "active_iso_assessment_result",
          JSON.stringify({
            ...(assessmentData || {}),
            rightAns,
            wrongAns,
            score,
            overallScore: assessmentData?.overallScore ?? score,
            industry: quizMetadata?.categoryName,
            management_level: quizMetadata?.difficulty,
            department: quizMetadata?.jobFunction,
            isFresh: true,
          })
        );

        localStorage.removeItem(STORAGE_KEY);
        const currentLang = params?.lang || 'en';
        router.push(`/${currentLang}/mastery-lab/success-evaluation`);
      }
      return;
    }

    await advanceAfterAnswer(selectedAnswers);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const loaderSteps = [
    t("mastery.loaderStep1", "Analyzing your industry context"),
    t("mastery.loaderStep2", "Building scenario-based questions"),
    t("mastery.loaderStep3", "Calibrating difficulty level"),
  ];

  if (!isLoaded) {
    return (
      <FullPageLoader
        isLoading
        title={t("mastery.loaderTitle", "Preparing your assessment")}
        description={t(
          "mastery.loaderDesc",
          "Building scenario-based questions for your role…"
        )}
        steps={loaderSteps}
      />
    );
  }

  const currentQ = quizQuestions[currentQuestion];
  const currentAnswer = selectedAnswers[currentQuestion];

  if (!currentQ) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-[15px] text-[var(--ib-mute)]">
          {t(
            "mastery.noActiveQuiz",
            "No active assessment found. Start a new one from Mastery Lab."
          )}
        </p>
        <Link
          href={`/${params?.lang || "en"}/mastery-lab`}
          className="inline-flex items-center justify-center rounded-[10px] bg-[var(--ib-acc)] px-5 py-2.5 text-[13px] font-bold text-white"
        >
          {t("mastery.cta", "Start Your Free Assessment")}
        </Link>
      </div>
    );
  }

  if (showResults) {
    const { rightAns, total } = calculateCounts();
    const overallPercent = total > 0 ? (rightAns / total) * 100 : 0;

    return (
      <div className="min-h-screen pt-12 pb-12 px-4" style={{ background: "var(--ib-bg)", fontFamily: "'Inter', sans-serif" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 xl:col-span-9 space-y-8">

            {/* Header Section */}
            <div className="text-center space-y-4 mb-12">
              <h1 className="text-5xl lg:text-[52px] font-semibold text-[var(--ib-ink)] leading-[1.1] tracking-tight text-center mb-8">
                ISO Competency Assessment
              </h1>
              <div className="flex flex-wrap justify-center gap-3 text-[var(--ib-mute)] text-sm font-bold uppercase tracking-widest">
                <span>{assessmentData?.industry || "Industry"}</span>
                <span className="opacity-30">|</span>
                <span>{assessmentData?.department || "Department"}</span>
                <span className="opacity-30">|</span>
                <span>{assessmentData?.management_level || "Management Level"}</span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] p-8 rounded-3xl text-center flex flex-col justify-center min-h-[160px]">
                <div className="text-3xl font-medium text-[var(--ib-ink)] mb-2">{assessmentData?.overallScore || Math.round(overallPercent)}%</div>
                <div className="text-[10px] font-medium text-[var(--ib-mute)] uppercase tracking-widest">Overall Score</div>
              </div>
              <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] p-8 rounded-3xl text-center flex flex-col justify-center min-h-[160px]">
                <div className="text-3xl font-medium text-[var(--ib-ink)] mb-2">{assessmentData?.benchmark?.industryAverage || "78"}%</div>
                <div className="text-[10px] font-medium text-[var(--ib-mute)] uppercase tracking-widest">Industry Avg.</div>
              </div>
              <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] p-8 rounded-3xl text-center flex flex-col justify-center min-h-[160px]">
                <div className="text-3xl font-medium text-red-500 mb-2">{assessmentData?.benchmark?.comparison || "Below Average"}</div>
                <div className="text-[10px] font-medium text-[var(--ib-mute)] uppercase tracking-widest">Benchmark</div>
              </div>
              <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] p-8 rounded-3xl text-center flex flex-col justify-center min-h-[160px]">
                <div className="text-xl font-medium text-[var(--ib-ink)] mb-2">{assessmentData?.aiFeedback?.competency_level?.title || "Foundational"}</div>
                <div className="text-[10px] font-medium text-[var(--ib-mute)] uppercase tracking-widest">Competency: {assessmentData?.aiFeedback?.competency_level?.code || "ISO-C1"}</div>
              </div>
            </div>

            {/* Competency Summary */}
            <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] p-10 rounded-[40px]">
              <h3 className="text-xs font-medium text-[var(--ib-acc)] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[var(--ib-acc)] rounded-full" /> Competency Summary
              </h3>
              <p className="text-lg text-[var(--ib-mute)] leading-relaxed font-medium">
                {assessmentData?.aiFeedback?.competency_level?.summary || "Analyzing your overall competency..."}
              </p>
            </div>

            {/* Strengths and Weaknesses side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] p-10 rounded-[40px] border-l-4 border-l-emerald-500/50">
                <h3 className="text-xs font-medium text-emerald-500 uppercase tracking-[0.2em] mb-8">Key Strengths</h3>
                <ul className="space-y-4">
                  {assessmentData?.aiFeedback?.analytical_feedback?.strengths.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-[var(--ib-mute)] flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> {s}
                    </li>
                  )) || <li className="text-[var(--ib-mute)] italic">No specific strengths identified yet.</li>}
                </ul>
              </div>
              <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] p-10 rounded-[40px] border-l-4 border-l-red-500/50">
                <h3 className="text-xs font-medium text-red-500 uppercase tracking-[0.2em] mb-8">Primary Weaknesses</h3>
                <ul className="space-y-4">
                  {assessmentData?.aiFeedback?.analytical_feedback?.weaknesses.map((w: string, i: number) => (
                    <li key={i} className="text-sm text-[var(--ib-mute)] flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" /> {w}
                    </li>
                  )) || <li className="text-[var(--ib-mute)] italic">No specific weaknesses identified.</li>}
                </ul>
              </div>
            </div>

            {/* Risk Assessment */}
            {assessmentData?.aiFeedback?.risk_assessment && (
              <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] p-10 rounded-[40px] border-l-4 border-l-red-500">
                <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-xs font-medium text-[var(--ib-ink)] uppercase tracking-[0.2em]">Risk Assessment</h3>
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-[8px] font-medium uppercase rounded border border-red-500/30">
                    {assessmentData.aiFeedback.risk_assessment.risk_level} {t('dynamic.dyn_rISK_620')}</span>
                </div>
                <div className="space-y-6">
                  <div>
                    <span className="text-sm font-medium text-[var(--ib-ink)] uppercase block mb-2">Impact:</span>
                    <p className="text-[var(--ib-mute)] leading-relaxed italic">
                      {assessmentData.aiFeedback.risk_assessment.impact_description}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[var(--ib-ink)] uppercase block mb-2">Mitigation:</span>
                    <p className="text-[var(--ib-mute)] leading-relaxed">
                      {assessmentData.aiFeedback.risk_assessment.mitigation_recommendation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Critical Focus Clauses */}
            {assessmentData?.aiFeedback?.analytical_feedback?.critical_focus_clauses && (
              <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] p-10 rounded-[40px]">
                <h3 className="text-xs font-medium text-[var(--ib-acc)] uppercase tracking-[0.2em] mb-8">Critical Focus Clauses</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assessmentData.aiFeedback.analytical_feedback.critical_focus_clauses.map((clause: string, i: number) => (
                    <div key={i} className="text-sm text-[var(--ib-mute)] flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--ib-acc)] mt-1.5 shrink-0" /> {clause}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategic Learning Roadmap */}
            {assessmentData?.aiFeedback?.learning_roadmap && (
              <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] p-10 rounded-[40px]">
                <h3 className="text-xs font-medium text-[var(--ib-acc)] uppercase tracking-[0.2em] mb-10">Strategic Learning Roadmap</h3>
                <div className="space-y-12">
                  {assessmentData.aiFeedback.learning_roadmap.map((item: any, i: number) => (
                    <div key={i} className="space-y-4 pb-8 border-b border-[var(--ib-line)] last:border-0 last:pb-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h4 className="text-lg font-bold text-[var(--ib-ink)]">{item.area}</h4>
                        <span className={`px-2 py-0.5 text-[8px] font-medium uppercase rounded border ${item.priority === 'High' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                          item.priority === 'Medium' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                          }`}>
                          Priority {item.priority}
                        </span>
                      </div>
                      <div className="text-[10px] text-[var(--ib-mute)] font-bold uppercase tracking-widest flex flex-wrap gap-x-4 gap-y-2">
                        <span className="text-[var(--ib-mute)]">Resources:</span>
                        {item.resources.map((res: string, idx: number) => (
                          <span key={idx} className="normal-case font-normal text-[var(--ib-mute)]">{res}{idx < item.resources.length - 1 ? ',' : ''}</span>
                        ))}
                      </div>
                      <div className="bg-[var(--ib-card)] p-6 rounded-2xl">
                        <span className="text-[10px] font-medium text-[var(--ib-ink)] uppercase block mb-2 tracking-widest">Action Item:</span>
                        <p className="text-sm text-[var(--ib-mute)] leading-relaxed">
                          {item.action_item}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mentor's Note */}
            {assessmentData?.aiFeedback?.mentor_closing_note && (
              <div className="bg-[var(--ib-acc)]/5 border border-[var(--ib-acc)]/10 p-10 rounded-[40px]">
                <h3 className="text-xs font-medium text-[var(--ib-acc)] uppercase tracking-[0.2em] mb-6">Mentor's Note</h3>
                <p className="text-lg text-[var(--ib-mute)] font-medium italic leading-relaxed">
                  "{assessmentData.aiFeedback.mentor_closing_note}"
                </p>
              </div>
            )}

            {/* Question Review (Original ResultCard style) */}
            <div className="pt-20 pb-12">
              <h3 className="text-xs font-medium text-[var(--ib-mute)] uppercase tracking-[0.2em] mb-10 text-center">Question Review Breakdown</h3>
              <ResultCard
                questionNumber={currentQuestion + 1}
                question={currentQ.question}
                userAnswer={selectedAnswers[currentQuestion]}
                correctAnswer={currentQ.correctAnswer}
                options={currentQ.options}
                explanation={currentQ.explanation}
              />

              <div className="flex flex-col items-center gap-4 mt-10 w-full">
                <div className="text-[var(--ib-mute)] font-black text-[10px] sm:text-[12px] uppercase tracking-widest text-center">
                  Question {currentQuestion + 1} {t('dynamic.dyn_of_479')}{quizQuestions.length}
                </div>
                <div className="flex justify-between items-center w-full gap-3 sm:gap-4">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-3 sm:px-8 sm:py-4 rounded-xl bg-[var(--ib-card)] border border-[var(--ib-line)] text-[var(--ib-ink)] text-xs sm:text-base font-bold hover:bg-[var(--ib-accbg)] transition-all disabled:opacity-30 active:scale-95"
                  >
                    <ArrowLeft size={16} className="shrink-0" /> Previous
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-3 sm:px-10 sm:py-4 rounded-xl bg-[var(--ib-acc)] text-white  text-xs sm:text-base font-bold transition-all active:scale-95"
                  >
                    {currentQuestion === quizQuestions.length - 1 ? "Finish Report" : "Next Result"}
                    <ArrowRight size={16} className="shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 xl:col-span-3">
            <Leaderboard />
          </div>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).filter(
    (key) => selectedAnswers[Number(key)]
  ).length;
  const totalQuestions = Math.max(quizQuestions.length, 1);
  const contextBits = [
    quizMetadata?.categoryName,
    quizMetadata?.difficulty,
    quizMetadata?.jobFunction,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[var(--ib-bg)] px-4 pb-16 pt-8 font-inter sm:px-6 sm:pb-20 sm:pt-10">
      <FullPageLoader
        isLoading={isSubmitting}
        title={t("mastery.submittingTitle", "Analyzing Your Performance")}
        description={t(
          "mastery.submittingDesc",
          "Our AI is evaluating your responses to generate a detailed competency report."
        )}
        steps={[
          t("mastery.submittingStep1", "Checking accuracy"),
          t("mastery.submittingStep2", "Benchmarking performance"),
          t("mastery.submittingStep3", "Generating roadmap"),
        ]}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-8 xl:col-span-9">
          <header className="mb-6 rounded-[24px] border border-[var(--ib-line)] bg-[var(--ib-card)] p-5 sm:mb-8 sm:p-6 md:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ib-acc)]">
                  ISOBrain.AI · Mastery Lab
                </p>
                <h1 className="mb-0! mt-2 text-[22px] font-bold tracking-[-0.03em] text-[var(--ib-ink)] sm:text-[28px]">
                  {quizTitle || t("mastery.assessmentTitle")}
                </h1>
                {contextBits.length > 0 ? (
                  <p className="mt-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--ib-mute)] sm:text-[13px]">
                    {contextBits.join(" · ")}
                  </p>
                ) : null}
                <p className="mt-3 text-[13px] text-[var(--ib-mute)]">
                  {answeredCount} / {totalQuestions}{" "}
                  {t("mastery.answeredLabel", "answered")}
                </p>
              </div>
              <div className="shrink-0 self-start sm:self-center">
                <Timer timeRemaining={timeRemaining} />
              </div>
            </div>
          </header>

          <QuizProgressBar
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
          />
          <QuestionCard
            question={currentQ.question}
            options={currentQ.options}
            selectedAnswer={currentAnswer}
            onAnswerSelect={handleAnswerSelect}
            onHintClick={() => setShowHint(true)}
            onSwipeNext={handleNext}
            onSwipePrev={currentQuestion > 0 ? handlePrevious : undefined}
            disableAnswers={isAdvancing || isSubmitting}
          />
          <HintModal
            isOpen={showHint}
            onClose={() => setShowHint(false)}
            hint={currentQ.hint}
            hintInsight={currentQ.hintInsight}
          />
        </div>
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="ib-card sticky top-24 overflow-hidden">
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentQuizPage;
