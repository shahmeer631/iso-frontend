"use client";

import React, { useState, useEffect } from "react";
import Leaderboard from "@/components/assessment/Leaderboard";
import ProgressBar from "@/components/mastery-lab/evaluation/ProgressBar";
import ExploreFeatures from "@/components/Shared/ExploreFeatures";
import { SkillHexGrid } from "@/components/assessment/SkillHexGrid";
import {
  Check,
  Loader2,
  Award,
  ArrowRight,
  RotateCcw,
  ShieldAlert,
  Brain,
  ListChecks,
  BookOpen,
  Target,
  TrendingDown,
  TrendingUp,
  Quote,
  AlertTriangle,
  ChevronRight,
  Info,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

export default function SuccessEvaluationPage() {
  const { lang } = useParams();
  const { t } = useTranslation();

  const [isLoaded, setIsLoaded] = useState(false);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [displayScores, setDisplayScores] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    const savedData = localStorage.getItem('active_iso_assessment_result');

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setAssessmentData(parsedData);

        // Find the actual result object (might be nested)
        let actual = parsedData;
        if (parsedData?.data) actual = parsedData.data;
        if (actual?.data) actual = actual.data;

        const getScore = (obj: any, baseKey: string): number => {
          if (!obj || typeof obj !== 'object') return 0;
          const searchKeys = [
            baseKey,
            baseKey.charAt(0).toUpperCase() + baseKey.slice(1),
            baseKey.toLowerCase(),
            `${baseKey}Score`,
            `${baseKey}_score`
          ];
          for (const k of searchKeys) {
            const val = obj[k];
            if (val !== undefined && val !== null) {
              const num = Number(val);
              if (!isNaN(num)) return num <= 1 && num > 0 ? Math.round(num * 100) : Math.round(num);
            }
          }
          // Recursive search
          for (const key in obj) {
            if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
              const nestedVal = getScore(obj[key], baseKey);
              if (nestedVal > 0) return nestedVal;
            }
          }
          return 0;
        };

        const rAns = Number(actual?.rightAns || getScore(actual, 'rightAns') || 0);
        const wAns = Number(actual?.wrongAns || getScore(actual, 'wrongAns') || 0);
        const totalAns = rAns + wAns;

        // Prioritize calculated percent if counts exist, else use raw score
        const calculatedPercent = totalAns > 0 ? Math.round((rAns / totalAns) * 100) : 0;
        const rawScore = Number(actual?.score || actual?.totalScore || actual?.overallScore || getScore(actual, 'score') || 0);

        const finalOverall = calculatedPercent > 0 ? calculatedPercent : rawScore;

        setCategoryName(actual.category || parsedData.category || actual.industry || t('mastery.assessmentTitle'));
        setOverallScore(finalOverall);

        // Add extra metadata for the UI
        const metadata = {
          industry: actual.industry || actual.metadata?.industry,
          managementLevel: actual.management_level || actual.metadata?.management_level,
          department: actual.department || actual.metadata?.department,
          timeTaken: actual.timeTaken || 0
        };
        (actual as any)._uiMetadata = metadata;

        setDisplayScores([
          { id: "compliance", title: t('mastery.complianceSubject') || "Compliance", score: getScore(actual, "compliance") || finalOverall },
          { id: "implementation", title: t('mastery.implementationSubject') || "Implementation", score: getScore(actual, "implementation") || finalOverall },
          { id: "auditing", title: t('mastery.auditingSubject') || "Auditing", score: getScore(actual, "auditing") || finalOverall },
          { id: "risk", title: t('mastery.riskManagementSubject') || "Risk Management", score: getScore(actual, "riskManagement") || getScore(actual, "risk") || finalOverall },
          { id: "governance", title: t('mastery.governanceSubject') || "Governance", score: getScore(actual, "governance") || finalOverall },
        ]);
      } catch (e) {
        console.error("Failed to parse assessment result:", e);
      }
    } else {
      setCategoryName(t('mastery.assessmentTitle'));
      setDisplayScores([
        { id: "compliance", title: t('mastery.complianceSubject') || "Compliance", score: 0 },
        { id: "implementation", title: t('mastery.implementationSubject') || "Implementation", score: 0 },
        { id: "auditing", title: t('mastery.auditingSubject') || "Auditing", score: 0 },
        { id: "risk", title: t('mastery.riskManagementSubject') || "Risk Management", score: 0 },
        { id: "governance", title: t('mastery.governanceSubject') || "Governance", score: 0 },
      ]);
    }
    setIsLoaded(true);
  }, [t]);

  if (!isLoaded) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--ib-bg)" }}>
        <Loader2 className="animate-spin" size={48} color="var(--ib-acc)" />
      </div>
    );
  }

  const skillMatrixData = displayScores.map(s => ({
    subject: s.title,
    value: s.score,
    fullMark: 100
  }));

  return (
    <div className="min-h-screen pt-12 pb-12 px-4" style={{ background: "var(--ib-bg)", fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Main Report Column */}
        <div className="lg:col-span-9 space-y-8">

          {/* Header Section */}
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--ib-acc)] shadow-lg mb-4">
              <Award className="text-white" size={32} />
            </div>
            <h1 className="text-5xl lg:text-[52px] font-semibold text-[var(--ib-ink)] leading-[1.1] tracking-tight text-center mb-8">
              Evaluation Results
            </h1>
            <div className="flex flex-wrap justify-center gap-3 text-[var(--ib-mute)] text-sm font-bold uppercase tracking-widest">
              <span>{categoryName}</span>
              {assessmentData?._uiMetadata && (
                <>
                  <span className="opacity-30">|</span>
                  <span>{assessmentData._uiMetadata.managementLevel} {t('dynamic.dyn_level_631')}</span>
                  <span className="opacity-30">|</span>
                  <span>{assessmentData._uiMetadata.department}</span>
                </>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] p-8 rounded-3xl text-center flex flex-col justify-center min-h-[160px]">
              <div className="text-3xl font-medium text-[var(--ib-ink)] mb-2">{overallScore}%</div>
              <div className="text-[10px] font-medium text-[var(--ib-mute)] uppercase tracking-widest">Overall Competency</div>
            </div>
            <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] p-8 rounded-3xl text-center flex flex-col justify-center min-h-[160px]">
              <div className="text-3xl font-medium text-[var(--ib-ink)] mb-2">{assessmentData?.benchmark?.industryAverage || "78"}%</div>
              <div className="text-[10px] font-medium text-[var(--ib-mute)] uppercase tracking-widest">Industry Avg.</div>
            </div>
            <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] p-8 rounded-3xl text-center flex flex-col justify-center min-h-[160px]">
              <div className={`text-2xl font-medium mb-2 ${assessmentData?.benchmark?.comparison === 'Below Average' ? 'text-red-500' : 'text-emerald-500'
                }`}>
                {assessmentData?.benchmark?.comparison || "Above Average"}
              </div>
              <div className="text-[10px] font-medium text-[var(--ib-mute)] uppercase tracking-widest">Benchmark</div>
            </div>
            <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] p-8 rounded-3xl text-center flex flex-col justify-center min-h-[160px]">
              <div className="text-xl font-medium text-[var(--ib-mute)] mb-2">
                {assessmentData?.aiFeedback?.competency_level?.title || "Foundational"}
              </div>
              <div className="text-[10px] font-medium text-[var(--ib-mute)] uppercase tracking-widest">
                {t('dynamic.dyn_code_633')}{assessmentData?.aiFeedback?.competency_level?.code || "ISO-C1"}
              </div>
            </div>
          </div>

          {/* Skill Matrix & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 bg-[var(--ib-card)] border border-[var(--ib-line)] p-4 sm:p-8 rounded-[40px] flex items-center justify-center">
              <SkillHexGrid color="var(--ib-acc)" data={skillMatrixData} />
            </div>
            <div className="md:col-span-8 bg-[var(--ib-card)] border border-[var(--ib-line)] p-6 sm:p-10 rounded-[40px] flex flex-col justify-center">
              <h3 className="text-xs font-medium text-[var(--ib-acc)] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[var(--ib-acc)] rounded-full" /> Competency Overview
              </h3>
              <p className="text-lg text-[var(--ib-mute)] leading-relaxed font-medium">
                {assessmentData?.aiFeedback?.competency_level?.summary || "Your detailed competency evaluation is ready. Review the sections below for a comprehensive analysis of your ISO standards mastery."}
              </p>
            </div>
          </div>

          {/* Detailed Breakdown Bars */}
          <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] p-6 sm:p-10 rounded-[40px]">
            <h3 className="text-xs font-medium text-[var(--ib-mute)] uppercase tracking-[0.2em] mb-8">Performance Breakdown</h3>
            <div className="space-y-4">
              {displayScores.map((item: any) => (
                <ProgressBar key={item.id} label={item.title} value={item.score} />
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] p-6 sm:p-10 rounded-[40px] border-l-4 border-l-emerald-500/50">
              <h3 className="text-xs font-medium text-emerald-500 uppercase tracking-[0.2em] mb-8">Core Strengths</h3>
              <ul className="space-y-4">
                {assessmentData?.aiFeedback?.analytical_feedback?.strengths.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-[var(--ib-mute)] flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> {s}
                  </li>
                )) || <li className="text-[var(--ib-mute)] italic">Strengths analysis pending...</li>}
              </ul>
            </div>
            <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] p-6 sm:p-10 rounded-[40px] border-l-4 border-l-red-500/50">
              <h3 className="text-xs font-medium text-red-500 uppercase tracking-[0.2em] mb-8">Critical Gaps</h3>
              <ul className="space-y-4">
                {assessmentData?.aiFeedback?.analytical_feedback?.weaknesses.map((w: string, i: number) => (
                  <li key={i} className="text-sm text-[var(--ib-mute)] flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" /> {w}
                  </li>
                )) || <li className="text-[var(--ib-mute)] italic">Weakness analysis pending...</li>}
              </ul>
            </div>
          </div>

          {/* Risk & Mitigation */}
          {assessmentData?.aiFeedback?.risk_assessment && (
            <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] p-6 sm:p-10 rounded-[40px] border-l-4 border-l-red-500">
              <div className="flex items-center gap-4 mb-8">
                <h3 className="text-xs font-medium text-[var(--ib-ink)] uppercase tracking-[0.2em]">Risk Exposure</h3>
                <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-[8px] font-medium uppercase rounded border border-red-500/30">
                  {assessmentData.aiFeedback.risk_assessment.risk_level} {t('dynamic.dyn_lEVEL_641')}</span>
              </div>
              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <span className="text-sm font-medium text-[var(--ib-ink)] uppercase block mb-2 tracking-widest">Organizational Impact:</span>
                  <p className="text-[var(--ib-mute)] leading-relaxed italic">
                    "{assessmentData.aiFeedback.risk_assessment.impact_description}"
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-[var(--ib-ink)] uppercase block mb-2 tracking-widest">Recommended Mitigation:</span>
                  <p className="text-[var(--ib-mute)] leading-relaxed">
                    {assessmentData.aiFeedback.risk_assessment.mitigation_recommendation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Learning Roadmap */}
          {assessmentData?.aiFeedback?.learning_roadmap && (
            <div className="bg-[var(--ib-card)] border border-[var(--ib-line)] p-6 sm:p-10 rounded-[40px]">
              <h3 className="text-xs font-medium text-[var(--ib-acc)] uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
                Strategic Learning Roadmap <Sparkles size={14} />
              </h3>
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
                    <div className="flex flex-wrap gap-2">
                      {item.resources.map((res: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-[var(--ib-card)] border border-[var(--ib-line)] rounded-lg text-[10px] text-[var(--ib-mute)]">
                          {res}
                        </span>
                      ))}
                    </div>
                    <div className="bg-[var(--ib-card)] p-6 rounded-2xl border border-[var(--ib-line)]">
                      <span className="text-[10px] font-medium text-[var(--ib-ink)] uppercase block mb-2 tracking-widest opacity-50">Recommended Action:</span>
                      <p className="text-sm text-[var(--ib-mute)] leading-relaxed">
                        {item.action_item}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mentor Quote */}
          {assessmentData?.aiFeedback?.mentor_closing_note && (
            <div className="bg-[var(--ib-accbg)] border border-[var(--ib-line)] p-12 rounded-[48px] text-center">
              <Quote className="text-[var(--ib-acc)]/20 mx-auto mb-6" size={48} />
              <p className="text-2xl text-[var(--ib-mute)] font-medium italic leading-relaxed max-w-4xl mx-auto">
                "{assessmentData.aiFeedback.mentor_closing_note}"
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-12 flex flex-col md:flex-row gap-4 md:gap-6 justify-center max-w-sm mx-auto md:max-w-none">
            <Link
              href={`/${lang}/academy`}
              className="px-6 py-3.5 md:px-12 md:py-5 rounded-full bg-[var(--ib-acc)] text-white text-white font-medium text-xs md:text-sm uppercase tracking-wider text-center flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            >
              Explore Academy <ArrowRight size={18} className="shrink-0" />
            </Link>
            <Link
              href={`/${lang}/mastery-lab`}
              className="px-6 py-3.5 md:px-12 md:py-5 rounded-full bg-[var(--ib-card)] border border-[var(--ib-line)] text-[var(--ib-ink)] font-bold text-xs md:text-sm uppercase tracking-wider text-center flex items-center justify-center gap-2 hover:bg-[var(--ib-accbg)] transition-all"
            >
              <RotateCcw size={18} className="shrink-0" /> Retake Assessment
            </Link>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-3">
          <div className="sticky top-24">
            <Leaderboard />
          </div>
        </div>

      </div>

      <div className="mt-24">
        <ExploreFeatures />
      </div>
    </div>
  );
}

