import React from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  timeRemaining: number;
}

export const Timer: React.FC<TimerProps> = ({ timeRemaining }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isLowTime = timeRemaining < 120; // Less than 2 minutes

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ 
        background: "rgba(255, 255, 255, 0.03)", 
        color: isLowTime ? "#EF4444" : "#FFFFFF", 
        padding: "12px 32px", 
        borderRadius: 20, 
        border: isLowTime ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(0, 240, 255, 0.2)",
        display: "flex", 
        alignItems: "center", 
        gap: 12,
        boxShadow: isLowTime ? "0 0 15px rgba(239, 68, 68, 0.1)" : "none",
        backdropFilter: "blur(8px)"
      }}>
        <Clock size={20} color={isLowTime ? "#EF4444" : "#D4AF37"} />
        <span className="font-inter" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.05em" }}>
          {formatTime(timeRemaining)}
        </span>
      </div>
    </div>
  );
};
