import React from "react";
import { Check } from "lucide-react";

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
    <button
      type="button"
      onClick={() => !disabled && onSelect(label)}
      disabled={disabled}
      aria-pressed={isSelected}
      className={`group flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 sm:items-center sm:gap-4 sm:px-5 sm:py-4 ${
        isSelected
          ? "border-[var(--ib-acc)] bg-[var(--ib-accbg)] shadow-[0_10px_28px_-20px_rgba(27,77,219,0.55)]"
          : "border-[var(--ib-line)] bg-[var(--ib-card)] hover:border-[color-mix(in_srgb,var(--ib-acc)_40%,var(--ib-line))] hover:bg-[color-mix(in_srgb,var(--ib-accbg)_55%,var(--ib-card))]"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]`}
    >
      <span
        className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border text-[13px] font-bold sm:mt-0 sm:size-9 sm:text-[15px] ${
          isSelected
            ? "border-[var(--ib-acc)] bg-[var(--ib-acc)] text-white"
            : "border-[var(--ib-line)] bg-[var(--ib-bg)] text-[var(--ib-mute)] group-hover:border-[color-mix(in_srgb,var(--ib-acc)_35%,var(--ib-line))] group-hover:text-[var(--ib-acc)]"
        }`}
      >
        {isSelected ? <Check className="size-4" strokeWidth={3} aria-hidden /> : label}
      </span>
      <span
        className={`min-w-0 flex-1 text-[13px] leading-relaxed sm:text-[15px] ${
          isSelected
            ? "font-semibold text-[var(--ib-ink)]"
            : "font-medium text-[var(--ib-mute)] group-hover:text-[var(--ib-ink)]"
        }`}
      >
        {text}
      </span>
    </button>
  );
};
