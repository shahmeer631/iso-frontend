"use client";

import React from "react";
import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { AnswerOption } from "./AnswerOption";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

interface QuestionOption {
  label: string;
  text: string;
}

interface QuestionCardProps {
  question: string;
  options: QuestionOption[];
  selectedAnswer?: string;
  onAnswerSelect: (label: string) => void;
  onHintClick: () => void;
  onSwipeNext?: () => void;
  onSwipePrev?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  options,
  selectedAnswer,
  onAnswerSelect,
  onHintClick,
  onSwipeNext,
  onSwipePrev,
}) => {
  const { t } = useTranslation();
  return (
    <div style={{
      background: "#1E212B",
      borderRadius: 32,
      padding: "clamp(24px, 5vw, 48px)",
      border: "1px solid #333333",
      marginBottom: 32,
      position: "relative"
    }}>
      {/* Question Text */}
      <h3
        className="space-grotesk text-sm sm:text-[18px]" style={{
          fontWeight: 400,
          color: "#FFFFFF",
          marginBottom: 32,
          lineHeight: 1.6
        }}>
        {question}
      </h3>

      {/* Answer Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
        {options.map((option, idx) => (
          <AnswerOption
            key={option.label}
            label={option.label}
            text={option.text}
            isSelected={selectedAnswer === option.label}
            onSelect={onAnswerSelect}
          />
        ))}
      </div>

      {/* Footer Info */}
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* <button
          onClick={onHintClick}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            color: "#FFB800", fontWeight: 600, fontSize: 16,
            background: "transparent", border: "none", cursor: "pointer"
          }}
          onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
          onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
        >
          <Lightbulb size={20} />
          {t('mastery.needHint')}
        </button> */}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={onSwipePrev}
            disabled={!onSwipePrev}
            style={{
              padding: "12px 32px", borderRadius: 12, fontWeight: 700, fontSize: 15,
              transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              background: !onSwipePrev ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
              color: !onSwipePrev ? "rgba(255,255,255,0.2)" : "#FFFFFF",
              border: !onSwipePrev ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(255,255,255,0.1)",
              cursor: !onSwipePrev ? "not-allowed" : "pointer"
            }}
          >
            {t('mastery.previous')}
          </button>
        </div>
      </div>
    </div>
  );
};
