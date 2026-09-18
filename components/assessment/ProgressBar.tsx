"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentQuestion,
  totalQuestions,
}) => {
  const { t } = useTranslation();
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div style={{ width: "100%", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
        <span className="font-inter" style={{ color: "#A0AAB2", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>
          {t('mastery.questionLabel')} <span style={{ color: "#FFFFFF" }}>{currentQuestion + 1}</span> {t('mastery.ofLabel')} <span style={{ color: "#FFFFFF" }}>{totalQuestions}</span>
        </span>
        <span className="font-inter" style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 13 }}>
          {Math.round(progress)}% {t('mastery.completePercent')}
        </span>
      </div>

      <div style={{ width: "100%", height: 6, background: "rgba(255, 255, 255, 0.05)", borderRadius: 99, overflow: "hidden" }}>
        <motion.div
          style={{ 
            height: "100%", 
            background: "#00F0FF",
            boxShadow: "0 0 10px rgba(63, 62, 237, 0.3)"
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};
