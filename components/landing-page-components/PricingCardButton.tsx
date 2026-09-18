"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plan } from "@/lib/redux/features/pricing/pricingApi";

interface PricingCardButtonProps {
  plan: Plan;
  isPopular: boolean;
  isProcessing: boolean;
  isCurrentPlan?: boolean;
  onClick: (plan: Plan) => void;
}

const PricingCardButton = ({
  plan,
  isPopular,
  isProcessing,
  isCurrentPlan,
  onClick,
}: PricingCardButtonProps) => {
  const buttonContent = isProcessing ? (
    <Loader2 className="w-5 h-5 animate-spin" />
  ) : isCurrentPlan ? (
    "Current Plan"
  ) : (
    plan.buttonText || (isPopular ? "Subscribe Now" : "Get Started")
  );

  return (
    <Button
      onClick={() => onClick(plan)}
      disabled={isProcessing || isCurrentPlan}
      variant={isPopular ? "default" : "outline"}
      className={`w-full py-7 text-lg rounded-xl font-bold transition-all mt-auto ${
        isCurrentPlan
          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
          : isPopular
          ? "bg-[#6366f1] hover:bg-[#5046E5] text-white shadow-lg shadow-indigo-200 border-none"
          : "text-[#6366f1] border-[#6366f1] hover:bg-[#6366f1] hover:text-white"
      }`}
    >
      {buttonContent}
    </Button>
  );
};

export default PricingCardButton;