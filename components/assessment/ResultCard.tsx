"use client";

import React from "react";
import { Lightbulb, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

interface QuestionOption {
  label: string;
  text: string;
}

interface ResultCardProps {
  questionNumber: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  options: QuestionOption[];
  explanation: string;
  standard?: string;
  clause?: string;
  version?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  questionNumber,
  question,
  userAnswer,
  correctAnswer,
  options,
  explanation,
  standard,
  clause,
  version,
}) => {
  const { t } = useTranslation();
  const isCorrect = userAnswer === correctAnswer;
  const userAnswerText = options.find((opt) => opt.label === userAnswer)?.text;
  const correctAnswerText = options.find(
    (opt) => opt.label === correctAnswer,
  )?.text;
  const standardLabel = [standard, version && !String(standard || "").includes(String(version))
    ? `(${version})`
    : null]
    .filter(Boolean)
    .join(" ");
  const referenceLabel = [standardLabel, clause ? `Clause ${clause}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div style={{
      background: "var(--ib-card)",
      borderRadius: 24,
      padding: "32px",
      border: "1px solid var(--ib-line)",
      marginBottom: 32
    }}>
      {/* Question */}
      <div className="flex flex-col sm:flex-row items-start gap-4 mb-6 sm:mb-8">
        <span className="font-inter" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 32, height: 32, borderRadius: 8,
          background: "rgba(27, 77, 219, 0.1)", color: "var(--ib-acc)",
          fontWeight: 700, fontSize: 14, flexShrink: 0
        }}>
          {questionNumber}
        </span>
        <div className="min-w-0 flex-1">
          {referenceLabel ? (
            <p
              className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--ib-acc)]"
              style={{ margin: "0 0 8px" }}
            >
              {referenceLabel}
            </p>
          ) : null}
          <h4 className="text-sm sm:text-lg" style={{ fontWeight: 400, color: "var(--ib-ink)", lineHeight: 1.6, margin: 0 }}>
            {question}
          </h4>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
        {/* User's answer if incorrect */}
        {!isCorrect && userAnswer && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5" style={{
            borderRadius: 16, border: "1px solid rgba(239, 68, 68, 0.2)",
            background: "rgba(239, 68, 68, 0.05)"
          }}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0 w-full">
              <div className="flex items-center gap-2 shrink-0">
                <XCircle size={18} color="#EF4444" className="shrink-0" />
                <span className="font-inter font-bold text-[#EF4444] shrink-0 text-sm sm:text-base">{userAnswer}.</span>
              </div>
              <span className="text-[var(--ib-mute)] font-medium text-sm leading-relaxed pl-7 sm:pl-0">
                {userAnswerText}
              </span>
            </div>
            <span className="font-inter w-fit mt-1 sm:mt-0 ml-7 sm:ml-0" style={{ color: "#EF4444", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", background: "rgba(239, 68, 68, 0.1)", padding: "4px 10px", borderRadius: 99, whiteSpace: "nowrap", flexShrink: 0 }}>
              ✕ {t("mastery.yourAnswer", "Your answer")}
            </span>
          </div>
        )}

        {/* Correct answer or User's answer if correct */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5" style={{
          borderRadius: 16, border: "1px solid rgba(16, 185, 129, 0.2)",
          background: "rgba(16, 185, 129, 0.05)"
        }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0 w-full">
            <div className="flex items-center gap-2 shrink-0">
              <CheckCircle2 size={18} color="#10B981" className="shrink-0" />
              <span className="font-inter font-bold text-[#10B981] shrink-0 text-sm sm:text-base">{correctAnswer}.</span>
            </div>
            <span className="text-[var(--ib-ink)] font-semibold text-sm leading-relaxed pl-7 sm:pl-0">
              {correctAnswerText}
            </span>
          </div>
          <span className="font-inter w-fit mt-1 sm:mt-0 ml-7 sm:ml-0" style={{ color: "#10B981", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", background: "rgba(16, 185, 129, 0.1)", padding: "4px 10px", borderRadius: 99, whiteSpace: "nowrap", flexShrink: 0 }}>
            ✓ {isCorrect
              ? t("mastery.correctChoice", "Correct choice")
              : t("mastery.correctAnswer", "Correct answer")}
          </span>
        </div>
      </div>

      {/* AI Explanation */}
      <div className="p-4 sm:p-6" style={{
        background: "var(--ib-bg)", borderRadius: 20,
        border: "1px solid var(--ib-line)", position: "relative"
      }}>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div style={{
            width: 48, height: 48, background: "rgba(27, 77, 219, 0.1)",
            borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, border: "1px solid rgba(27, 77, 219, 0.2)"
          }}>
            <Lightbulb size={24} color="var(--ib-acc)" />
          </div>
          <div style={{ flex: 1 }}>
            <p className="text-base sm:text-lg" style={{ fontWeight: 700, color: "var(--ib-ink)", marginBottom: 8, margin: 0 }}>
              {t("mastery.explainerInsight", "Explainer insight")}
            </p>
            <p style={{ fontSize: 14, color: "var(--ib-mute)", lineHeight: 1.6, fontWeight: 500, margin: "8px 0 0" }}>
              {explanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
