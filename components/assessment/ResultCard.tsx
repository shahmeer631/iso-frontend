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
}

export const ResultCard: React.FC<ResultCardProps> = ({
  questionNumber,
  question,
  userAnswer,
  correctAnswer,
  options,
  explanation,
}) => {
  const { t } = useTranslation();
  const isCorrect = userAnswer === correctAnswer;
  const userAnswerText = options.find((opt) => opt.label === userAnswer)?.text;
  const correctAnswerText = options.find(
    (opt) => opt.label === correctAnswer,
  )?.text;

  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.02)",
      borderRadius: 24,
      padding: "32px",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      marginBottom: 32
    }}>
      {/* Question */}
      <div className="flex flex-col sm:flex-row items-start gap-4 mb-6 sm:mb-8">
        <span className="font-inter" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 32, height: 32, borderRadius: 8,
          background: "rgba(0, 240, 255, 0.1)", color: "#00F0FF",
          fontWeight: 700, fontSize: 14, flexShrink: 0
        }}>
          {questionNumber}
        </span>
        <h4 className="space-grotesk text-sm sm:text-lg" style={{ fontWeight: 400, color: "#FFFFFF", lineHeight: 1.6, margin: 0 }}>
          {question}
        </h4>
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
              <span className="text-[#A0AAB2] font-medium text-sm leading-relaxed pl-7 sm:pl-0">
                {userAnswerText}
              </span>
            </div>
            <span className="font-inter w-fit mt-1 sm:mt-0 ml-7 sm:ml-0" style={{ color: "#EF4444", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", background: "rgba(239, 68, 68, 0.1)", padding: "4px 10px", borderRadius: 99, whiteSpace: "nowrap", flexShrink: 0 }}>
              ✕ {t('mastery.yourAnswer')}
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
            <span className="text-[#FFFFFF] font-semibold text-sm leading-relaxed pl-7 sm:pl-0">
              {correctAnswerText}
            </span>
          </div>
          <span className="font-inter w-fit mt-1 sm:mt-0 ml-7 sm:ml-0" style={{ color: "#10B981", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", background: "rgba(16, 185, 129, 0.1)", padding: "4px 10px", borderRadius: 99, whiteSpace: "nowrap", flexShrink: 0 }}>
            ✓ {isCorrect ? t('mastery.correctChoice') : t('mastery.correctAnswer')}
          </span>
        </div>
      </div>

      {/* AI Explanation */}
      <div className="p-4 sm:p-6" style={{
        background: "#0F111A", borderRadius: 20,
        border: "1px solid rgba(255, 255, 255, 0.05)", position: "relative"
      }}>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div style={{
            width: 48, height: 48, background: "rgba(176, 38, 255, 0.1)",
            borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, border: "1px solid rgba(176, 38, 255, 0.2)"
          }}>
            <Lightbulb size={24} color="#B026FF" />
          </div>
          <div style={{ flex: 1 }}>
            <p className="space-grotesk text-base sm:text-lg" style={{ fontWeight: 700, color: "#FFFFFF", marginBottom: 8, margin: 0 }}>
              {t('mastery.explainerInsight')}
            </p>
            <p style={{ fontSize: 14, color: "#A0AAB2", lineHeight: 1.6, fontWeight: 500, margin: "8px 0 0" }}>
              {explanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
