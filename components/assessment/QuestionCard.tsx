"use client";

import React from "react";
import { AnswerOption } from "./AnswerOption";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";
import { ArrowLeft } from "lucide-react";

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
  disableAnswers?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  options,
  selectedAnswer,
  onAnswerSelect,
  onSwipePrev,
  disableAnswers = false,
}) => {
  const { t } = useTranslation();
  return (
    <div className="relative mb-8 rounded-[24px] border border-[var(--ib-line)] bg-[var(--ib-card)] p-5 sm:mb-8 sm:rounded-[32px] sm:p-8 md:p-10">
      <h3 className="mb-0! text-[15px] font-medium leading-relaxed text-[var(--ib-ink)] sm:text-[18px]">
        {question}
      </h3>

      <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:gap-4">
        {options.map((option) => (
          <AnswerOption
            key={option.label}
            label={option.label}
            text={option.text}
            isSelected={selectedAnswer === option.label}
            onSelect={onAnswerSelect}
            disabled={disableAnswers}
          />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSwipePrev}
          disabled={!onSwipePrev}
          className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-bold transition-all sm:px-6 sm:py-3 sm:text-[14px] ${
            !onSwipePrev
              ? "cursor-not-allowed border-[var(--ib-line)] bg-[var(--ib-bg)] text-[var(--ib-mute)] opacity-50"
              : "border-[var(--ib-line)] bg-[var(--ib-bg)] text-[var(--ib-ink)] hover:border-[color-mix(in_srgb,var(--ib-acc)_35%,var(--ib-line))] hover:bg-[var(--ib-accbg)]"
          } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]`}
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          {t("mastery.previous", "Previous")}
        </button>
      </div>
    </div>
  );
};
