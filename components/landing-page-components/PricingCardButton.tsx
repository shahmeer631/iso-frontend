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
      className={`w-full py-7 text-[14.5px] rounded-[10px] font-semibold transition-all mt-auto ${
        isCurrentPlan
          ? "bg-[var(--ib-bg)] text-[var(--ib-mute)] border-[var(--ib-line)] cursor-not-allowed"
          : isPopular
          ? "bg-[var(--ib-acc)] hover:opacity-92 text-white border border-[var(--ib-acc)] shadow-none"
          : "text-[var(--ib-ink)] bg-[var(--ib-card)] border border-[var(--ib-line)] hover:bg-[var(--ib-bg)]"
      }`}
    >
      {buttonContent}
    </Button>
  );
};

export default PricingCardButton;