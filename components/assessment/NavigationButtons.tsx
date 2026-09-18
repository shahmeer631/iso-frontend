import { ArrowLeft, ArrowRight } from "lucide-react";
import React from "react";

interface NavigationButtonsProps {
  isAnswered: boolean;
  onPrevious: () => void;
  onNext: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  isAnswered,
  onPrevious,
  onNext,
  isFirstQuestion,
  isLastQuestion,
}) => {
  return (
    <div className="flex justify-between items-center mt-6 gap-3 sm:gap-4 w-full">
      <button
        onClick={onPrevious}
        disabled={isFirstQuestion}
        className={`flex-1 inline-flex justify-center items-center gap-2 px-3 py-3 md:px-10 md:py-3.5 rounded-xl md:rounded-2xl font-bold transition-all text-sm md:text-lg border-2 ${isFirstQuestion
            ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
            : "bg-white text-[#475569] border-[#E2E8F0] hover:bg-gray-50 active:scale-95 shadow-sm"
          }`}
      >
        <ArrowLeft className="w-5 h-5 shrink-0" /> Previous
      </button>

      <button
        onClick={onNext}
        disabled={!isAnswered}
        className={`flex-1 inline-flex justify-center items-center gap-2 px-3 py-3 md:px-10 md:py-3.5 rounded-xl md:rounded-2xl font-bold transition-all text-sm md:text-lg shadow-md ${!isAnswered
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-[#4F46E5] text-white hover:bg-[#4338CA] hover:shadow-lg active:scale-95"
          }`}
      >
        {isLastQuestion ? "Submit" : "Next"} <ArrowRight className="w-5 h-5 shrink-0" />
      </button>
    </div>
  );
};
