"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  /** Questions with a selected answer — used for true quiz progress. */
  answeredCount?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentQuestion,
  totalQuestions,
  answeredCount,
}) => {
  const { t } = useTranslation();
  const total = Math.max(totalQuestions, 1);
  const answered =
    typeof answeredCount === "number"
      ? Math.max(0, Math.min(total, answeredCount))
      : Math.min(total, currentQuestion + 1);
  const progress = (answered / total) * 100;

  return (
    <div style={{ width: "100%", marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 12,
          gap: 12,
        }}
      >
        <span
          className="font-inter"
          style={{
            color: "var(--ib-mute)",
            fontWeight: 600,
            fontSize: 13,
            textTransform: "uppercase",
          }}
        >
          {t("mastery.questionLabel", "Question")}{" "}
          <span style={{ color: "var(--ib-ink)" }}>{currentQuestion + 1}</span>{" "}
          {t("mastery.ofLabel", "of")}{" "}
          <span style={{ color: "var(--ib-ink)" }}>{totalQuestions}</span>
        </span>
        <span
          className="font-inter"
          style={{ color: "var(--ib-ink)", fontWeight: 700, fontSize: 13 }}
          aria-label={t("mastery.quizProgress", "Quiz Progress")}
        >
          {t("mastery.quizProgress", "Progress")}: {Math.round(progress)}%
        </span>
      </div>

      <div
        style={{
          width: "100%",
          height: 6,
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <motion.div
          style={{
            height: "100%",
            background: "var(--ib-acc)",
            boxShadow: "0 0 10px rgba(27, 77, 219, 0.3)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};
