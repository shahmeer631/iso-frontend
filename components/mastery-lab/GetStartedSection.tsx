"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/client";

interface Option {
  label: string;
  value: string;
}

interface GetStartedCardProps {
  industries: Option[];
  managementLevels: Option[];
  departments: Option[];
  onSubmit: (data: {
    industry: string;
    managementLevel: string;
    department: string;
  }) => void;
  buttonText?: string;
}

export default function GetStartedCard({
  industries,
  managementLevels,
  departments,
  buttonText,
  onSubmit,
}: GetStartedCardProps) {
  const { t } = useTranslation();
  const [industry, setIndustry] = useState("");
  const [managementLevel, setManagementLevel] = useState("");
  const [department, setDepartment] = useState("");

  const displayButtonText = buttonText || t("pricingPage.startAssessment");
  const isDisabled = !industry || !managementLevel || !department;

  const handleSubmit = () => {
    if (isDisabled) return;
    onSubmit({ industry, managementLevel, department });
  };

  return (
    <div className="ib-card relative overflow-hidden p-5 sm:p-8 md:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-[var(--ib-accbg)] blur-[80px]"
      />

      <h3 className="relative z-[1] mb-0! flex items-center gap-2.5 text-[15px] font-bold text-[var(--ib-ink)] sm:text-[17px]">
        <span
          className="h-4 w-1 rounded-full bg-[var(--ib-acc)]"
          aria-hidden
        />
        Set your context
      </h3>

      <div className="relative z-[1] mt-6 space-y-5">
        <div>
          <p className="mb-2 pl-0.5 text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--ib-acc)] sm:text-[13px]">
            Step 1 — Select Your Industry
          </p>
          <Select onValueChange={setIndustry}>
            <SelectTrigger className="h-11 rounded-[10px] border-[var(--ib-line)] bg-[var(--ib-bg)] text-xs text-[var(--ib-ink)] sm:text-sm">
              <SelectValue placeholder={t("dynamic.dyn_selectindustry_86")} />
            </SelectTrigger>
            <SelectContent className="border-[var(--ib-line)] bg-[var(--ib-card)] text-[var(--ib-ink)]">
              {industries.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  className="cursor-pointer text-sm focus:bg-[var(--ib-acc)] focus:text-white"
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="mb-2 pl-0.5 text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--ib-acc)] sm:text-[13px]">
            Step 2 — Define your management level
          </p>
          <Select onValueChange={setManagementLevel}>
            <SelectTrigger className="h-11 rounded-[10px] border-[var(--ib-line)] bg-[var(--ib-bg)] text-xs text-[var(--ib-ink)] sm:text-sm">
              <SelectValue placeholder={t("dynamic.dyn_selectlevel_87")} />
            </SelectTrigger>
            <SelectContent className="border-[var(--ib-line)] bg-[var(--ib-card)] text-[var(--ib-ink)]">
              {managementLevels.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  className="cursor-pointer text-sm focus:bg-[var(--ib-acc)] focus:text-white"
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="mb-2 pl-0.5 text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--ib-acc)] sm:text-[13px]">
            Step 3 — Choose your department or function
          </p>
          <Select onValueChange={setDepartment}>
            <SelectTrigger className="h-11 rounded-[10px] border-[var(--ib-line)] bg-[var(--ib-bg)] text-xs text-[var(--ib-ink)] sm:text-sm">
              <SelectValue placeholder={t("dynamic.dyn_selectdepartment_88")} />
            </SelectTrigger>
            <SelectContent className="border-[var(--ib-line)] bg-[var(--ib-card)] text-[var(--ib-ink)]">
              {departments.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  className="cursor-pointer text-sm focus:bg-[var(--ib-acc)] focus:text-white"
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          disabled={isDisabled}
          onClick={handleSubmit}
          className="h-12 w-full rounded-[10px] bg-[var(--ib-acc)] text-[13px] font-bold text-white shadow-[0_12px_28px_-14px_rgba(27,77,219,0.55)] transition-all duration-200 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
        >
          {displayButtonText}
        </Button>
      </div>
    </div>
  );
}
