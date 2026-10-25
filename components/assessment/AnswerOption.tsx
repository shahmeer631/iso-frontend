import React from "react";
import { motion } from "framer-motion";

interface AnswerOptionProps {
  label: string;
  text: string;
  isSelected: boolean;
  onSelect: (label: string) => void;
  disabled?: boolean;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  label,
  text,
  isSelected,
  onSelect,
  disabled = false,
}) => {
  return (
    <motion.button
      whileHover={!disabled ? { backgroundColor: "rgba(255,255,255,0.05)" } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      onClick={() => !disabled && onSelect(label)}
      disabled={disabled}
      className="px-4 py-3 sm:px-6 sm:py-4"
      style={{
        width: "100%",
        textAlign: "left",
        borderRadius: 16,
        border: isSelected ? "1px solid var(--ib-acc)" : "1px solid var(--ib-line)",
        background: isSelected ? "rgba(27, 77, 219, 0.05)" : "rgba(255,255,255,0.02)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        transition: "all 0.2s ease",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        boxShadow: isSelected ? "0 0 20px rgba(27, 77, 219, 0.1)" : "none",
        outline: "none"
      }}
    >
      <div
        className="font-inter text-sm sm:text-[18px]"
        style={{
          fontWeight: 700,
          color: isSelected ? "var(--ib-acc)" : "var(--ib-mute)",
          flexShrink: 0
        }}
      >
        {label}.
      </div>
      <span
        className="text-xs sm:text-base"
        style={{
          fontWeight: 500,
          lineHeight: 1.4,
          color: isSelected ? "#FFFFFF" : "var(--ib-mute)"
        }}
      >
        {text}
      </span>
    </motion.button>
  );
};
