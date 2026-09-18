"use client";

import React from "react";
import { X, Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  hint: string;
  hintInsight: string;
}

export const HintModal: React.FC<HintModalProps> = ({
  isOpen,
  onClose,
  hint,
  hintInsight,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      zIndex: 1000
    }}>
      <div style={{
        background: "#1E212B",
        borderRadius: 24,
        maxWidth: 448,
        width: "100%",
        padding: 32,
        position: "relative",
        border: "1px solid #333333",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            color: "#A0AAB2",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "color 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#FFFFFF"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#A0AAB2"}
        >
          <X size={20} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 40, height: 40, background: "rgba(255, 184, 0, 0.1)",
            borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(255, 184, 0, 0.2)"
          }}>
            <Lightbulb size={20} color="#FFB800" />
          </div>
          <h3 className="space-grotesk" style={{ fontSize: 24, fontWeight: 700, color: "#FFFFFF", margin: 0 }}>{t('mastery.aiHint')}</h3>
        </div>

        <p style={{ color: "#A0AAB2", fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>{hint}</p>



        <button
          onClick={onClose}
          style={{
            width: "100%",
            background: "#FFB800",
            color: "#0F111A",
            padding: "14px 0",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 16,
            border: "none",
            cursor: "pointer",
            transition: "transform 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          {t('mastery.gotIt')}
        </button>
      </div>
    </div>
  );
};
