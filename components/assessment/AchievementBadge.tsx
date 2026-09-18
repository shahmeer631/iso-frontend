import React from "react";
import { motion } from "framer-motion";

interface AchievementBadgeProps {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  description: string;
  isUnlocked: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  icon: Icon,
  name,
  description,
  isUnlocked,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative p-5 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 ${
        isUnlocked
          ? "bg-white border-slate-200 shadow-xl opacity-100"
          : "bg-slate-50 border-slate-100 opacity-50 grayscale"
      }`}
    >
      {/* Holographic / Metallic Effect Overlay */}
      {isUnlocked && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden opacity-20"
          style={{
            background:
              "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)",
            backgroundSize: "200% 200%",
            animation: "shimmer 3s infinite linear",
          }}
        />
      )}

      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${
          isUnlocked ? "bg-indigo-600" : "bg-slate-200"
        }`}
      >
        <Icon
          className={`w-7 h-7 ${isUnlocked ? "text-white" : "text-slate-400"}`}
        />
      </div>

      <h5 className="text-sm font-bold text-slate-800 mb-1">{name}</h5>
      <p className="text-[10px] text-slate-500 font-medium leading-tight">
        {description}
      </p>

      {/* Unlock Glow */}
      {isUnlocked && (
        <div className="absolute -inset-1 bg-indigo-500 rounded-2xl -z-10 blur-sm opacity-20 animate-pulse" />
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </motion.div>
  );
};
