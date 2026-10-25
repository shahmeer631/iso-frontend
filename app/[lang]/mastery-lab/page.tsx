"use client";

import GetStartedCard from "@/components/mastery-lab/GetStartedSection";
import ExploreFeatures from "@/components/Shared/ExploreFeatures";
import { useGenerateQuizMutation } from "@/lib/redux/api/quizApi";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Settings, Clock, Unlock, Target, ArrowRight } from "lucide-react";
import FullPageLoader from "@/components/Shared/FullPageLoader";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n/client";
import Leaderboard from "@/components/assessment/Leaderboard";
import { useEffect } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

const HARDCODED_INDUSTRIES = [
  "Aerospace",
  "Agriculture",
  "Amusement Parks",
  "Artificial Intelligence",
  "Asset Management",
  "Automotive",
  "Biotechnology & Life Sciences",
  "Chemical & Allied Products",
  "Construction & Engineering",
  "Corporate Compliance",
  "Customer Service",
  "Cybersecurity & Data Privacy",
  "Education",
  "Energy & Utilities",
  "Environmental Management",
  "Event Management",
  "Facility Management",
  "Financial Services",
  "Food & Beverage",
  "Government & Public Sector",
  "Healthcare & Medical Services",
  "Human Resources",
  "Information Technology (IT)",
  "Laboratories & Testing",
  "Legal & Compliance",
  "Logistics & Supply Chain",
  "Manufacturing",
  "Maritime & Shipping",
  "Medical Devices",
  "Mining & Heavy Industry",
  "Non-Profit & NGOs",
  "Oil & Gas",
  "Packaging",
  "Pharmaceuticals",
  "Renewable Energy",
  "Road Traffic Safety",
  "Telecommunications",
  "Tourism & Hospitality",
  "Waste Management & Circular Economy",
].map((item) => ({ label: item, value: item }));

const HARDCODED_DEPARTMENTS = [
  "Academic Administration",
  "Business Continuity & Resilience",
  "Clinical Laboratory",
  "Corporate Social Responsibility (CSR)",
  "Customer Service",
  "Customer Support",
  "Cybersecurity",
  "Data Privacy & GDPR Compliance",
  "Data Science",
  "Design & Development",
  "EHS (Environmental Health & Safety)",
  "Engineering",
  "Enterprise Risk",
  "Ethics & Anti-Bribery",
  "Event Management",
  "Executive Board",
  "Facilities",
  "Facilities Management",
  "Finance",
  "Health & Safety",
  "Information Security (ISMS)",
  "Hospital Admin",
  "Human Resources",
  "Internal Audit",
  "International Trade & Export",
  "IT (Information Technology)",
  "Laboratory Operations",
  "Legal/Compliance",
  "Manufacturing",
  "Marketing",
  "Operations",
  "Partner & Vendor Management",
  "Pathology",
  "PR (Public Relations)",
  "Procurement",
  "Production",
  "Quality Assurance",
  "Quality Control",
  "R&D (Research & Development)",
  "Regulatory Affairs",
  "Security & Loss Prevention",
  "Student Affairs",
  "Supply Chain",
  "Sustainability",
  "Technical Committees",
].map((item) => ({ label: item, value: item }));

const AssessmentPage = () => {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang]);

  const [generateQuiz, { isLoading: isGeneratingQuiz }] = useGenerateQuizMutation();

  const handleStartAssessment = async (data: {
    industry: string;
    managementLevel: string;
    department: string;
  }) => {
    try {
      const res = await generateQuiz({
        context: {
          industry: data.industry,
          management_level: data.managementLevel,
          department: data.department,
        },
        num_questions: 10,
        difficulty: "intermediate",
      }).unwrap();

      const quizData = res.data || res;
      const questionsRaw = quizData.questions || [];

      if (questionsRaw.length > 0) {
        const transformedQuestions = questionsRaw.map((q: any, idx: number) => ({
          id: idx + 1,
          question: q.question,
          options: Object.entries(q.options).map(([label, text]) => ({
            label,
            text: String(text),
          })),
          correctAnswer: q.correct_answer,
          explanation: q.explanation,
          hint: q.hint,
          hintInsight: q.explanation,
        }));

        const quizPayload = {
          title: quizData.quiz_title || "ISO Assessment Evaluation",
          questions: transformedQuestions,
          generatedAt: quizData.generated_at || new Date().toISOString(),
          categoryId: data.industry,
          categoryName: data.industry,
          difficulty: data.managementLevel,
          jobFunction: data.department,
        };

        localStorage.setItem("active_iso_quiz", JSON.stringify(quizPayload));
        localStorage.removeItem("mastery_lab_progress");
        localStorage.removeItem("iso_assessment_progress");
        localStorage.removeItem("last_selected_option");
        localStorage.removeItem("all_selected_answers");

        router.push(`/${lang}/mastery-lab/assessment`);
      } else {
        console.warn("No questions found in the quiz data.");
        toast.error(
          t(
            "mastery.failedGenerate",
            "Failed to generate enough questions. Please try again."
          )
        );
      }
    } catch (err: any) {
      console.error("Critical error in startAssessment:", err);
      toast.error(
        err?.data?.message ||
          t(
            "mastery.generating",
            "Failed to generate quiz. Our AI might be busy, please try again."
          )
      );
    }
  };

  const scrollToAssessment = () => {
    document
      .getElementById("assessment-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const howItWorks = [
    {
      step: "1",
      title: t("mastery.step1Title"),
      desc: t("mastery.step1Desc"),
      icon: Settings,
      color: "var(--ib-acc)",
    },
    {
      step: "2",
      title: t("mastery.step2Title"),
      desc: t("mastery.step2Desc"),
      icon: Clock,
      color: "#D97706",
    },
    {
      step: "3",
      title: t("mastery.step3Title"),
      desc: t("mastery.step3Desc"),
      icon: Unlock,
      color: "var(--ib-acc)",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--ib-bg)] font-inter text-[var(--ib-ink)] selection:bg-[var(--ib-acc)] selection:text-white">
      {/* ── Hero ─────────────────────────────────────────── */}
      <header className="relative overflow-x-clip border-b border-[var(--ib-line)] px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-16">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-14%] h-[520px] w-[min(920px,100%)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--ib-acc)_14%,transparent),transparent_70%)]" />
        </div>

        <div className="ib-w relative z-[1] max-w-4xl! text-center">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="ib-eye mx-auto inline-flex items-center gap-2">
              <Target className="size-3.5" aria-hidden />
              {t("mastery.badge")}
            </div>

            <h1 className="mb-0! mt-3 text-[30px] font-bold leading-[1.12] tracking-[-0.035em] text-[var(--ib-ink)] sm:text-[40px] lg:text-[48px]">
              {t("mastery.heroHeading")}
            </h1>

            <p className="mt-3 text-[16px] font-semibold text-[var(--ib-ink)]/80 sm:text-[18px]">
              {t("mastery.heroSubtitle")}
            </p>

            <p className="mx-auto mt-4 max-w-[640px] text-[15px] leading-relaxed text-[var(--ib-mute)] sm:text-[16.5px]">
              {t("mastery.description")}
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.1, ease }}
            className="mt-8 flex flex-col items-center gap-4"
          >
            <button
              type="button"
              onClick={scrollToAssessment}
              className="group inline-flex items-center justify-center gap-2 rounded-[12px] bg-[var(--ib-acc)] px-7 py-3.5 text-[14px] font-semibold text-white shadow-[0_14px_32px_-14px_rgba(27,77,219,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)] sm:px-8 sm:py-4 sm:text-[16px]"
            >
              {t("mastery.cta")}
              <ArrowRight
                className="size-5 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </button>
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[12px] text-[var(--ib-mute)] sm:text-[13px]">
              <span>{t("mastery.info1")}</span>
              <span className="hidden text-[var(--ib-line)] sm:inline" aria-hidden>
                •
              </span>
              <span>{t("mastery.infoPersonalized")}</span>
              <span className="hidden text-[var(--ib-line)] sm:inline" aria-hidden>
                •
              </span>
              <span>{t("mastery.infoProfessionals")}</span>
            </p>
          </motion.div>
        </div>
      </header>

      {/* ── Certificate preview ──────────────────────────── */}
      <section className="relative overflow-x-clip px-4 py-10 sm:px-6 sm:py-14">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease }}
          className="flex justify-center"
        >
          <div className="relative max-w-4xl transition-transform duration-500 hover:-translate-y-1">
            <Image
              src="/certificate.jpg"
              alt={t("dynamic.dyn_cPDCertificate_225")}
              width={800}
              height={600}
              className="h-auto w-full rounded-2xl border border-[var(--ib-line)] object-contain shadow-[0_24px_60px_-28px_rgba(11,18,32,0.35)]"
              priority
            />
          </div>
        </motion.div>
      </section>

      {/* ── Assessment configuration ─────────────────────── */}
      <section
        id="assessment-form"
        className="relative scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20"
      >
        <div className="ib-w max-w-7xl!">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, ease }}
            className="mb-10 text-center md:mb-12"
          >
            <h2 className="mb-0! text-[28px] font-bold leading-[1.2] tracking-[-0.03em] text-[var(--ib-ink)] sm:text-[34px] lg:text-[38px]">
              {t("mastery.configTitle")}
            </h2>
          </motion.div>

          <FullPageLoader
            isLoading={isGeneratingQuiz}
            title={t("mastery.loaderTitle")}
            description={t("mastery.loaderDesc")}
            steps={[
              t("mastery.loaderStep1"),
              t("mastery.loaderStep2"),
              t("mastery.loaderStep3"),
            ]}
          />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-8">
              <GetStartedCard
                industries={HARDCODED_INDUSTRIES}
                managementLevels={[
                  { label: "Manager", value: "Manager" },
                  { label: "Senior", value: "Senior" },
                  { label: "Entry", value: "Entry" },
                ]}
                departments={HARDCODED_DEPARTMENTS}
                onSubmit={handleStartAssessment}
                buttonText={
                  isGeneratingQuiz ? t("mastery.generating") : t("mastery.cta")
                }
              />

              <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
                {howItWorks.map((s, i) => (
                  <motion.div
                    key={s.step}
                    initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      duration: 0.4,
                      delay: reduceMotion ? 0 : i * 0.06,
                      ease,
                    }}
                    className="ib-card flex flex-col gap-4 p-5 sm:p-6"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex size-11 items-center justify-center rounded-full border bg-[var(--ib-card)]"
                        style={{ borderColor: `${s.color}50` }}
                      >
                        <span
                          className="text-[16px] font-bold"
                          style={{ color: s.color }}
                        >
                          {s.step}
                        </span>
                      </div>
                      <h3 className="mb-0! text-[16px] font-semibold text-[var(--ib-ink)] sm:text-[17px]">
                        {s.title}
                      </h3>
                    </div>
                    <p className="text-[14px] leading-relaxed text-[var(--ib-mute)]">
                      {s.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="ib-card sticky top-24 overflow-hidden">
                <Leaderboard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Next steps ───────────────────────────────────── */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="ib-w max-w-7xl!">
          <div className="ib-card p-5 sm:p-8 md:p-10">
            <ExploreFeatures />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AssessmentPage;
