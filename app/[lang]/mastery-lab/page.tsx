"use client";


import GetStartedCard from '@/components/mastery-lab/GetStartedSection';
import ExploreFeatures from '@/components/Shared/ExploreFeatures';
import { useGenerateQuizMutation } from '@/lib/redux/api/quizApi';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Settings, Clock, Unlock } from 'lucide-react';
import FullPageLoader from '@/components/Shared/FullPageLoader';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n/client";
import Leaderboard from '@/components/assessment/Leaderboard';
import { useEffect } from 'react';



const HARDCODED_INDUSTRIES = [
  "Aerospace", "Agriculture", "Amusement Parks", "Artificial Intelligence", "Asset Management",
  "Automotive", "Biotechnology & Life Sciences", "Chemical & Allied Products", "Construction & Engineering",
  "Corporate Compliance", "Customer Service", "Cybersecurity & Data Privacy", "Education", "Energy & Utilities",
  "Environmental Management", "Event Management", "Facility Management", "Financial Services", "Food & Beverage",
  "Government & Public Sector", "Healthcare & Medical Services", "Human Resources", "Information Technology (IT)",
  "Laboratories & Testing", "Legal & Compliance", "Logistics & Supply Chain", "Manufacturing", "Maritime & Shipping",
  "Medical Devices", "Mining & Heavy Industry", "Non-Profit & NGOs", "Oil & Gas", "Packaging", "Pharmaceuticals",
  "Renewable Energy", "Road Traffic Safety", "Telecommunications", "Tourism & Hospitality", "Waste Management & Circular Economy"
].map(item => ({ label: item, value: item }));

const HARDCODED_DEPARTMENTS = [
  "Academic Administration", "Business Continuity & Resilience", "Clinical Laboratory", "Corporate Social Responsibility (CSR)",
  "Customer Service", "Customer Support", "Cybersecurity", "Data Privacy & GDPR Compliance", "Data Science",
  "Design & Development", "EHS (Environmental Health & Safety)", "Engineering", "Enterprise Risk", "Ethics & Anti-Bribery",
  "Event Management", "Executive Board", "Facilities", "Facilities Management", "Finance", "Health & Safety",
  "Information Security (ISMS)", "Hospital Admin", "Human Resources", "Internal Audit", "International Trade & Export",
  "IT (Information Technology)", "Laboratory Operations", "Legal/Compliance", "Manufacturing", "Marketing", "Operations",
  "Partner & Vendor Management", "Pathology", "PR (Public Relations)", "Procurement", "Production", "Quality Assurance",
  "Quality Control", "R&D (Research & Development)", "Regulatory Affairs", "Security & Loss Prevention", "Student Affairs",
  "Supply Chain", "Sustainability", "Technical Committees"
].map(item => ({ label: item, value: item }));

const AssessmentPage = () => {
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang || 'en';
  const { t } = useTranslation();

  // Sync i18n language with the URL [lang] param
  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang as string);
    }
  }, [lang]);

  const [generateQuiz, { isLoading: isGeneratingQuiz }] = useGenerateQuizMutation();

  const handleStartAssessment = async (data: { industry: string, managementLevel: string, department: string }) => {
    try {
      const res = await generateQuiz({
        context: {
          industry: data.industry,
          management_level: data.managementLevel,
          department: data.department
        },
        num_questions: 10,
        difficulty: "intermediate"
      }).unwrap();

      const quizData = res.data || res;
      const questionsRaw = quizData.questions || [];

      if (questionsRaw.length > 0) {
        const transformedQuestions = questionsRaw.map((q: any, idx: number) => ({
          id: idx + 1,
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

        const quizPayload = {
          title: quizData.quiz_title || "ISO Assessment Evaluation",
          questions: transformedQuestions,
          generatedAt: quizData.generated_at || new Date().toISOString(),
          categoryId: data.industry,
          categoryName: data.industry,
          difficulty: data.managementLevel,
          jobFunction: data.department
        };

        localStorage.setItem("active_iso_quiz", JSON.stringify(quizPayload));
        localStorage.removeItem("mastery_lab_progress");
        localStorage.removeItem("iso_assessment_progress");
        localStorage.removeItem("last_selected_option");
        localStorage.removeItem("all_selected_answers");

        const currentLang = params?.lang || 'en';
        const targetPath = `/${currentLang}/mastery-lab/assessment`;
        router.push(targetPath);
      } else {
        console.warn("No questions found in the quiz data.");
        toast.error(t('mastery.failedGenerate', 'Failed to generate enough questions. Please try again.'));
      }
    } catch (err: any) {
      console.error("Critical error in startAssessment:", err);
      toast.error(err?.data?.message || t('mastery.generating', 'Failed to generate quiz. Our AI might be busy, please try again.'));
    }
  };

  const scrollToAssessment = () => {
    document.getElementById("assessment-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ background: "#0F111A", paddingTop: 30, minHeight: "100vh", fontFamily: "'Space Grotesk', sans-serif" }}>
      <section style={{
        position: "relative",
        padding: "clamp(60px, 10vw, 120px) 24px clamp(40px, 8vw, 80px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: "10%", left: "-10%", width: 600, height: 600,
          background: "radial-gradient(circle, rgba(0,240,255,0.05) 0%, transparent 60%)",
          filter: "blur(60px)", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", right: "-10%", width: 700, height: 700,
          background: "radial-gradient(circle, rgba(176,38,255,0.05) 0%, transparent 60%)",
          filter: "blur(80px)", pointerEvents: "none"
        }} />

        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 10 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px",
            borderRadius: 99, background: "rgba(0,240,255,0.1)", border: "1px solid rgba(0,240,255,0.2)",
            marginBottom: 24
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00F0FF" }} />
            <span className="font-inter" style={{ color: "#00f0ff", fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t('mastery.badge')}</span>
          </div>

          <h2 className="space-grotesk text-5xl lg:text-[52px] font-semibold text-white leading-[1.1] tracking-tight mb-8">
            {t('mastery.heroHeading')}
          </h2>
          <h3 className="font-semibold text-white/80 block mb-2">{t('mastery.heroSubtitle')}</h3>
          <p className="text-[#A1A1A6] text-sm lg:text-lg max-w-4xl mx-auto leading-relaxed mb-12 font-inter">
            {t('mastery.description')}
          </p>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <button
              onClick={scrollToAssessment}
              className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-full text-sm sm:text-lg font-medium cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 border-none"
              style={{
                background: "#00F0FF", color: "#0F111A"
              }}
            >
              {t('mastery.cta')}
            </button>
            <p className="font-inter flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs sm:text-[13px] text-[#A0AAB2]">
              <span>{t('mastery.info1')}</span>
              <span className="text-gray-800 hidden xs:inline">•</span>
              <span>{t('mastery.infoPersonalized')}</span>
              <span className="text-gray-800 hidden xs:inline">•</span>
              <span>{t('mastery.infoProfessionals')}</span>
            </p>
          </div>
        </div>
      </section>

      <div className=" relative px-4 lg:px-0">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="  flex justify-center perspective-[2000px]"
        >
          <div className="relative group rotate-x-2 transition-transform duration-700 hover:rotate-x-0">

            <Image
              src="/certificate.jpg"
              alt={t('dynamic.dyn_cPDCertificate_225')}
              width={800}
              height={600}
              className="object-contain rounded-2xl shadow-2xl border border-white/10 w-full max-w-4xl h-auto"
              priority
            />
          </div>
        </motion.div>
      </div>

      <section id="assessment-form" style={{ padding: "clamp(80px, 10vw, 120px) 24px", position: "relative" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 className="space-grotesk text-4xl lg:text-[42px] font-semibold text-white leading-[1.2] tracking-tight mb-8">{t('mastery.configTitle')}</h2>
          </div>

          <FullPageLoader
            isLoading={isGeneratingQuiz}
            title={t('mastery.loaderTitle')}
            description={t('mastery.loaderDesc')}
            steps={[
              t('mastery.loaderStep1'),
              t('mastery.loaderStep2'),
              t('mastery.loaderStep3'),
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
              <GetStartedCard
                industries={HARDCODED_INDUSTRIES}
                managementLevels={[
                  { label: "Manager", value: "Manager" },
                  { label: "Senior", value: "Senior" },
                  { label: "Entry", value: "Entry" }
                ]}
                departments={HARDCODED_DEPARTMENTS}
                onSubmit={handleStartAssessment}
                buttonText={isGeneratingQuiz ? t('mastery.generating') : t('mastery.cta')}
              />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32, marginTop: 64 }}>
                {[
                  { step: "1", title: t('mastery.step1Title'), desc: t('mastery.step1Desc'), icon: Settings, color: "#00F0FF" },
                  { step: "2", title: t('mastery.step2Title'), desc: t('mastery.step2Desc'), icon: Clock, color: "#FFB800" },
                  { step: "3", title: t('mastery.step3Title'), desc: t('mastery.step3Desc'), icon: Unlock, color: "#B026FF" }
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#1E212B", border: `1px solid ${s.color}50`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span className="font-inter" style={{ color: s.color, fontWeight: 700, fontSize: 18 }}>{s.step}</span>
                      </div>
                      <h3 className="space-grotesk" style={{ fontSize: 18, fontWeight: 500, color: "#FFFFFF" }}>{s.title}</h3>
                    </div>
                    <p style={{ color: "#A0AAB2", fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div style={{ background: "#1E212B", borderRadius: 24, border: "1px solid #333333", overflow: "hidden", height: "fit-content", position: "sticky", top: 24 }}>
                <Leaderboard />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 sm:px-6" style={{ maxWidth: 1280, margin: "0 auto", paddingBottom: 80 }}>
        <div className="p-4 sm:p-10" style={{ background: "#1E212B", borderRadius: 24, border: "1px solid #333333" }}>
          <ExploreFeatures />
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;
