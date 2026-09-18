interface ProgressBarProps {
  label: string;
  value: number;
}

export default function ProgressBar({ label, value }: ProgressBarProps) {
  const getTextColor = (v: number) => {
    if (v >= 80) return "#D4AF37";
    if (v >= 50) return "#B026FF";
    return "#FFB800";
  };

  return (
    <div className="flex items-center gap-3 sm:gap-5 px-4 py-3 sm:px-6 sm:py-4" style={{
      background: "rgba(255, 255, 255, 0.03)",
      borderRadius: "20px",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)"
    }}>
      {/* Label - Left Side */}
      <span className="font-inter w-24 sm:w-36 text-[10px] sm:text-xs font-bold text-[#A0AAB2] uppercase tracking-wider truncate shrink-0">
        {label}
      </span>

      {/* Progress Track - Center (Recessed Style) */}
      <div className="flex-1 h-5 sm:h-6 bg-black/20 rounded-full p-1 shadow-inner" style={{
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)"
      }}>
        {/* Progress Fill - Gradient Style */}
        <div
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)",
            borderRadius: 99,
            transition: "width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
            width: `${value}%`,
            boxShadow: "0 0 15px rgba(59, 130, 246, 0.4)"
          }}
        />
      </div>

      {/* Percentage - Right Side */}
      <span className="font-inter w-10 sm:w-12 text-right text-xs sm:text-base font-extrabold shrink-0" style={{
        color: getTextColor(value)
      }}>
        {value}%
      </span>
    </div>
  );
}
