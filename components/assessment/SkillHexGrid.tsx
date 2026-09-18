"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

interface SkillData {
  subject: string;
  value: number; // 0 to 100
  fullMark: number;
}

interface SkillHexGridProps {
  data: SkillData[];
  color?: string;
}

export const SkillHexGrid: React.FC<SkillHexGridProps> = ({ data, color = "#D4AF37" }) => {
  const { t } = useTranslation();
  const width = 380;
  const height = 300;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 95;
  const angleStep = (Math.PI * 2) / data.length;

  // Generate points for the background grid (concentric pentagons/hexagons)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];
  const gridLines = gridLevels.map((level) => {
    return data
      .map((_, i) => {
        const x =
          centerX + radius * level * Math.cos(i * angleStep - Math.PI / 2);
        const y =
          centerY + radius * level * Math.sin(i * angleStep - Math.PI / 2);
        return `${x},${y}`;
      })
      .join(" ");
  });

  // Generate points for the skill polygon
  const skillPoints = data
    .map((d, i) => {
      const r = radius * (d.value / d.fullMark);
      const x = centerX + r * Math.cos(i * angleStep - Math.PI / 2);
      const y = centerY + r * Math.sin(i * angleStep - Math.PI / 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-[#1E212B] rounded-[32px] border border-white/5 shadow-inner w-full">
      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">
        {t('mastery.skillMatrix')}
      </h4>
      <div className="relative w-full max-w-[380px] h-[300px] flex items-center justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full transform animate-in fade-in zoom-in duration-1000"
        >
          {/* Background Grid */}
          {gridLines.map((points, i) => (
            <polygon
              key={i}
              points={points}
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="1"
            />
          ))}

          {/* Axis Lines */}
          {data.map((_, i) => {
            const x = centerX + radius * Math.cos(i * angleStep - Math.PI / 2);
            const y = centerY + radius * Math.sin(i * angleStep - Math.PI / 2);
            return (
              <line
                key={i}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
              />
            );
          })}

          {/* Skill Polygon */}
          <motion.polygon
            points={skillPoints}
            fill={`${color}33`}
            stroke={color}
            strokeWidth="3"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "circOut" }}
          />

          {/* Labels */}
          {data.map((d, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const cosVal = Math.cos(angle);
            
            // Determine text anchor based on angle to prevent clipping
            let textAnchor: "start" | "middle" | "end" = "middle";
            let labelRadius = radius + 20;
            
            if (cosVal > 0.3) {
              textAnchor = "start";
              labelRadius = radius + 10; // Bring closer to chart if left-aligned to keep balance
            } else if (cosVal < -0.3) {
              textAnchor = "end";
              labelRadius = radius + 10; // Bring closer to chart if right-aligned to keep balance
            }

            const x = centerX + labelRadius * Math.cos(angle);
            const y = centerY + labelRadius * Math.sin(angle);
            
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                className="text-[9px] sm:text-[10px] font-bold"
                fill="#A0AAB2"
              >
                {d.subject}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
