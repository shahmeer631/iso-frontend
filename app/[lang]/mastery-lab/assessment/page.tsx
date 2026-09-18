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

  const [quizQuestions, setQuizQuestions] = useState<Question[]>(QUESTIONS);
  const [quizTitle, setQuizTitle] = useState(t('mastery.assessmentTitle'));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [showHint, setShowHint] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(INITIAL_TIME);
  const [showResults, setShowResults] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [assessmentData, setAssessmentData] = useState<SubmitAssessmentResponse['data'] | null>(null);
  const [guestId, setGuestId] = useState<string>("");
  const [hasTriggeredTen, setHasTriggeredTen] = useState(false);
  const [hasTriggeredTwenty, setHasTriggeredTwenty] = useState(false);
  const [generateQuiz] = useGenerateQuizMutation();
  const [quizMetadata, setQuizMetadata] = useState<any>(null);

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
    let baseQuestions = QUESTIONS;

    if (activeQuiz) {
      try {
        const parsedQuiz = JSON.parse(activeQuiz);
        if (parsedQuiz.questions && parsedQuiz.questions.length > 0) {
          baseQuestions = parsedQuiz.questions;
          setQuizQuestions(parsedQuiz.questions);
          setQuizTitle(parsedQuiz.title || t('mastery.assessmentTitle'));
          setCategoryId(parsedQuiz.categoryId || "");
          setQuizMetadata({
            categoryId: parsedQuiz.categoryId,
            categoryName: parsedQuiz.categoryName,
            difficulty: parsedQuiz.difficulty,
            jobFunction: parsedQuiz.jobFunction
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
        const { currentQuestion, selectedAnswers, timeRemaining, showResults } = JSON.parse(savedProgress);
        setCurrentQuestion(currentQuestion || 0);
        setSelectedAnswers(selectedAnswers || {});
        setTimeRemaining(timeRemaining || INITIAL_TIME);
        setShowResults(showResults || false);
      } catch (e) {
        console.error("Failed to parse progress", e);
      }
    }
    setIsLoaded(true);
  }, []);

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

  const handleAnswerSelect = (label: string) => {
    if (!showResults) {
      setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: label });

      // Save option select to localStorage
      try {
        const currentQ = quizQuestions[currentQuestion];
        const selectedOptionText = currentQ?.options?.find(o => o.label === label)?.text || "";
        const answerRecord = {
          questionIndex: currentQuestion,
          questionText: currentQ?.question || "",
          selectedOption: label,
          optionText: selectedOptionText,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem("last_selected_option", JSON.stringify(answerRecord));
        
        const existingAnswers = JSON.parse(localStorage.getItem("all_selected_answers") || "[]");
        const updatedAnswers = existingAnswers.filter((item: any) => item.questionIndex !== currentQuestion);
        updatedAnswers.push(answerRecord);
        updatedAnswers.sort((a: any, b: any) => a.questionIndex - b.questionIndex);
        localStorage.setItem("all_selected_answers", JSON.stringify(updatedAnswers));
      } catch (e) {
        console.error("Failed to save answer to local storage", e);
      }

      setTimeout(() => {
        handleNext();
      }, 400);
    }
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
        difficulty: "intermediate"
      }).unwrap();

      const quizData = res.data || res;
      const extraQuestionsRaw = quizData.questions || [];

      if (extraQuestionsRaw.length > 0) {
        const transformedExtra = extraQuestionsRaw.map((q: any, idx: number) => ({
          id: quizQuestions.length + idx + 1,
          question: q.question,
          options: Object.entries(q.options).map(([label, text]) => ({
            label,
            text: String(text)
          })),
          correctAnswer: q.correct_answer,
          explanation: q.explanation,
          hint: q.hint,
          hintInsight: q.explanation
        }));

        setQuizQuestions(prev => {
          const combined = [...prev, ...transformedExtra].slice(0, 30);
          const activeQuiz = localStorage.getItem("active_iso_quiz");
          if (activeQuiz) {
            try {
              const parsed = JSON.parse(activeQuiz);
              parsed.questions = combined;
              localStorage.setItem("active_iso_quiz", JSON.stringify(parsed));
            } catch (e) { }
          }
          return combined;
        });
      }
    } catch (error) { }
  };

  const handleNext = async () => {
    if (showResults) {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        const { rightAns, wrongAns } = calculateCounts();
        // Explicitly save the results for the success-evaluation page
        localStorage.setItem('active_iso_assessment_result', JSON.stringify({
          rightAns,
          wrongAns,
          score: Math.round((rightAns / (rightAns + wrongAns)) * 100),
          isFresh: true
        }));

        localStorage.removeItem(STORAGE_KEY);
        const currentLang = params?.lang || 'en';
        router.push(`/${currentLang}/mastery-lab/success-evaluation`);
      }
      return;
    }

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (quizQuestions.length < 30) {
      toast.info(t('mastery.loadingMore', 'Loading more questions, please wait a moment...'));
      return;
    } else {
      const { rightAns, wrongAns } = calculateCounts();
      try {
        const timeTaken = INITIAL_TIME - timeRemaining;
        const answersPayload = quizQuestions.map((q, idx) => ({
          question: q.question,
          selected_answer: selectedAnswers[idx] || "",
          correct_answer: q.correctAnswer
        }));

        const response = await submitAssessment({
          userId: user?.id || null,
          guestId: !token ? guestId : undefined,
          timeTaken,
          metadata: {
            industry: quizMetadata?.categoryName || "General",
            management_level: quizMetadata?.difficulty || "Manager",
            department: quizMetadata?.jobFunction || "Operation",
            suggestedStandards: quizMetadata?.categoryName ? [quizMetadata.categoryName] : ["ISO 9001"]
          },
          answers: answersPayload
        }).unwrap();

        if (response) {
          const dataToSave = response.data || response;

          // Inject counts for the success page
          const resultWithCounts = {
            ...dataToSave,
            rightAns,
            wrongAns
          };

          setAssessmentData(resultWithCounts);
          localStorage.setItem('active_iso_assessment_result', JSON.stringify(resultWithCounts));
        }
        setShowResults(true);
        setCurrentQuestion(0);
      } catch (error: any) {
        console.error("Critical error in submitAssessment:", error);
        const isUnauthorized =
          error?.status === 401 ||
          error?.data?.statusCode === 401 ||
          error?.data?.message?.toLowerCase().includes("unauthorized") ||
          error?.message?.toLowerCase().includes("unauthorized");

        if (isUnauthorized) {
          toast.error(t('auth.loginRequired', 'Please sign in to submit your assessment.'));
          const currentLang = params?.lang || 'en';
          const fromPath = `/${currentLang}/mastery-lab/assessment`;
          router.push(`/${currentLang}/auth/login?from=${encodeURIComponent(fromPath)}`);
          return;
        }

        // For other errors, still show results screen
        setShowResults(true);
        setCurrentQuestion(0);
      }
    }
  };

  const calculateCounts = () => {
    const rightAns = quizQuestions.filter((q, idx) => {
      return selectedAnswers[idx] === q.correctAnswer;
    }).length;
    const total = quizQuestions.length;
    const wrongAns = total - rightAns;
    return { rightAns, wrongAns, total };
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  if (!isLoaded) return null;

  const currentQ = quizQuestions[currentQuestion];
  const currentAnswer = selectedAnswers[currentQuestion];

  if (!currentQ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F111A]">
        <div className="animate-spin w-8 h-8 border-4 border-brand-cyan border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (showResults) {
    const { rightAns, total } = calculateCounts();
    const overallPercent = total > 0 ? (rightAns / total) * 100 : 0;

    return (
      <div className="min-h-screen pt-24 pb-12 px-4" style={{ background: "#0F111A", fontFamily: "'Space Grotesk', sans-serif" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 xl:col-span-9 space-y-8">

            {/* Header Section */}
            <div className="text-center space-y-4 mb-12">
              <h1 className="space-grotesk text-5xl lg:text-[52px] font-semibold text-white leading-[1.1] tracking-tight text-center mb-8">
                ISO Competency Assessment
              </h1>
              <div className="flex flex-wrap justify-center gap-3 text-gray-400 text-sm font-bold uppercase tracking-widest">
                <span>{assessmentData?.industry || "Industry"}</span>
                <span className="opacity-30">|</span>
                <span>{assessmentData?.department || "Department"}</span>
                <span className="opacity-30">|</span>
                <span>{assessmentData?.management_level || "Management Level"}</span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#1E212B] border border-white/5 p-8 rounded-3xl text-center flex flex-col justify-center min-h-[160px]">
                <div className="text-3xl font-medium text-white mb-2">{assessmentData?.overallScore || Math.round(overallPercent)}%</div>
                <div className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Overall Score</div>
              </div>
              <div className="bg-[#1E212B] border border-white/5 p-8 rounded-3xl text-center flex flex-col justify-center min-h-[160px]">
                <div className="text-3xl font-medium text-white mb-2">{assessmentData?.benchmark?.industryAverage || "78"}%</div>
                <div className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Industry Avg.</div>
              </div>
              <div className="bg-[#1E212B] border border-white/5 p-8 rounded-3xl text-center flex flex-col justify-center min-h-[160px]">
                <div className="text-3xl font-medium text-red-500 mb-2">{assessmentData?.benchmark?.comparison || "Below Average"}</div>
                <div className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Benchmark</div>
              </div>
              <div className="bg-[#1E212B] border border-white/5 p-8 rounded-3xl text-center flex flex-col justify-center min-h-[160px]">
                <div className="text-xl font-medium text-white mb-2">{assessmentData?.aiFeedback?.competency_level?.title || "Foundational"}</div>
                <div className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Competency: {assessmentData?.aiFeedback?.competency_level?.code || "ISO-C1"}</div>
              </div>
            </div>

            {/* Competency Summary */}
            <div className="bg-[#1E212B] border border-white/5 p-10 rounded-[40px]">
              <h3 className="text-xs font-medium text-cyan-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-cyan-500 rounded-full" /> Competency Summary
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed font-medium">
                {assessmentData?.aiFeedback?.competency_level?.summary || "Analyzing your overall competency..."}
              </p>
            </div>

            {/* Strengths and Weaknesses side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1E212B] border border-white/5 p-10 rounded-[40px] border-l-4 border-l-emerald-500/50">
                <h3 className="text-xs font-medium text-emerald-500 uppercase tracking-[0.2em] mb-8">Key Strengths</h3>
                <ul className="space-y-4">
                  {assessmentData?.aiFeedback?.analytical_feedback?.strengths.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-gray-400 flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> {s}
                    </li>
                  )) || <li className="text-gray-500 italic">No specific strengths identified yet.</li>}
                </ul>
              </div>
              <div className="bg-[#1E212B] border border-white/5 p-10 rounded-[40px] border-l-4 border-l-red-500/50">
                <h3 className="text-xs font-medium text-red-500 uppercase tracking-[0.2em] mb-8">Primary Weaknesses</h3>
                <ul className="space-y-4">
                  {assessmentData?.aiFeedback?.analytical_feedback?.weaknesses.map((w: string, i: number) => (
                    <li key={i} className="text-sm text-gray-400 flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" /> {w}
                    </li>
                  )) || <li className="text-gray-500 italic">No specific weaknesses identified.</li>}
                </ul>
              </div>
            </div>

            {/* Risk Assessment */}
            {assessmentData?.aiFeedback?.risk_assessment && (
              <div className="bg-[#1E212B] border border-white/5 p-10 rounded-[40px] border-l-4 border-l-red-500">
                <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-xs font-medium text-white uppercase tracking-[0.2em]">Risk Assessment</h3>
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-[8px] font-medium uppercase rounded border border-red-500/30">
                    {assessmentData.aiFeedback.risk_assessment.risk_level} {t('dynamic.dyn_rISK_620')}</span>
                </div>
                <div className="space-y-6">
                  <div>
                    <span className="text-sm font-medium text-white uppercase block mb-2">Impact:</span>
                    <p className="text-gray-400 leading-relaxed italic">
                      {assessmentData.aiFeedback.risk_assessment.impact_description}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white uppercase block mb-2">Mitigation:</span>
                    <p className="text-gray-400 leading-relaxed">
                      {assessmentData.aiFeedback.risk_assessment.mitigation_recommendation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Critical Focus Clauses */}
            {assessmentData?.aiFeedback?.analytical_feedback?.critical_focus_clauses && (
              <div className="bg-[#1E212B] border border-white/5 p-10 rounded-[40px]">
                <h3 className="text-xs font-medium text-cyan-500 uppercase tracking-[0.2em] mb-8">Critical Focus Clauses</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assessmentData.aiFeedback.analytical_feedback.critical_focus_clauses.map((clause: string, i: number) => (
                    <div key={i} className="text-sm text-gray-400 flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" /> {clause}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategic Learning Roadmap */}
            {assessmentData?.aiFeedback?.learning_roadmap && (
              <div className="bg-[#1E212B] border border-white/5 p-10 rounded-[40px]">
                <h3 className="text-xs font-medium text-cyan-500 uppercase tracking-[0.2em] mb-10">Strategic Learning Roadmap</h3>
                <div className="space-y-12">
                  {assessmentData.aiFeedback.learning_roadmap.map((item: any, i: number) => (
                    <div key={i} className="space-y-4 pb-8 border-b border-white/5 last:border-0 last:pb-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h4 className="text-lg font-bold text-white">{item.area}</h4>
                        <span className={`px-2 py-0.5 text-[8px] font-medium uppercase rounded border ${item.priority === 'High' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                          item.priority === 'Medium' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                          }`}>
                          Priority {item.priority}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex flex-wrap gap-x-4 gap-y-2">
                        <span className="text-gray-400">Resources:</span>
                        {item.resources.map((res: string, idx: number) => (
                          <span key={idx} className="normal-case font-normal text-gray-500">{res}{idx < item.resources.length - 1 ? ',' : ''}</span>
                        ))}
                      </div>
                      <div className="bg-white/5 p-6 rounded-2xl">
                        <span className="text-[10px] font-medium text-white uppercase block mb-2 tracking-widest">Action Item:</span>
                        <p className="text-sm text-gray-400 leading-relaxed">
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
              <div className="bg-cyan-500/5 border border-cyan-500/10 p-10 rounded-[40px]">
                <h3 className="text-xs font-medium text-cyan-500 uppercase tracking-[0.2em] mb-6">Mentor's Note</h3>
                <p className="text-lg text-gray-300 font-medium italic leading-relaxed">
                  "{assessmentData.aiFeedback.mentor_closing_note}"
                </p>
              </div>
            )}

            {/* Question Review (Original ResultCard style) */}
            <div className="pt-20 pb-12">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-[0.2em] mb-10 text-center">Question Review Breakdown</h3>
              <ResultCard
                questionNumber={currentQuestion + 1}
                question={currentQ.question}
                userAnswer={selectedAnswers[currentQuestion]}
                correctAnswer={currentQ.correctAnswer}
                options={currentQ.options}
                explanation={currentQ.explanation}
              />

              <div className="flex flex-col items-center gap-4 mt-10 w-full">
                <div className="text-gray-500 font-black text-[10px] sm:text-[12px] uppercase tracking-widest text-center">
                  Question {currentQuestion + 1} {t('dynamic.dyn_of_479')}{quizQuestions.length}
                </div>
                <div className="flex justify-between items-center w-full gap-3 sm:gap-4">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-3 sm:px-8 sm:py-4 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-base font-bold hover:bg-white/10 transition-all disabled:opacity-30 active:scale-95"
                  >
                    <ArrowLeft size={16} className="shrink-0" /> Previous
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-3 sm:px-10 sm:py-4 rounded-xl bg-[#00f0ff] text-[#0F111A]  text-xs sm:text-base font-bold transition-all active:scale-95"
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

  return (
    <div style={{ background: "#0F111A", minHeight: "100vh", padding: "100px 16px 64px" }}>
      <FullPageLoader
        isLoading={isSubmitting}
        title={t('mastery.submittingTitle', 'Analyzing Your Performance')}
        description={t('mastery.submittingDesc', 'Our AI is evaluating your responses to generate a detailed competency report.')}
        steps={[
          t('mastery.submittingStep1', 'Checking accuracy'),
          t('mastery.submittingStep2', 'Benchmarking performance'),
          t('mastery.submittingStep3', 'Generating roadmap')
        ]}
      />
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 xl:col-span-9">
          <Timer timeRemaining={timeRemaining} />
          <QuizProgressBar currentQuestion={currentQuestion} totalQuestions={30} />
          <QuestionCard
            question={currentQ.question}
            options={currentQ.options}
            selectedAnswer={currentAnswer}
            onAnswerSelect={handleAnswerSelect}
            onHintClick={() => setShowHint(true)}
            onSwipeNext={handleNext}
            onSwipePrev={handlePrevious}
          />
          <HintModal isOpen={showHint} onClose={() => setShowHint(false)} hint={currentQ.hint} hintInsight={currentQ.hintInsight} />
        </div>
        <div className="lg:col-span-4 xl:col-span-3">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
};

export default AssessmentQuizPage;
