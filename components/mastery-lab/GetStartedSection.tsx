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
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [industry, setIndustry] = useState("");
  const [managementLevel, setManagementLevel] = useState("");
  const [department, setDepartment] = useState("");

  const displayButtonText = buttonText || t('pricingPage.startAssessment');
  const isDisabled = !industry || !managementLevel || !department;

  const handleSubmit = () => {
    if (isDisabled) return;

    onSubmit({
      industry,
      managementLevel,
      department,
    });
  };

  return (
    <div
      className="p-4 sm:p-8 md:p-10"
      style={{
        background: "#1E212B",
        borderRadius: 24,
        border: "1px solid #333333",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Light modern accent inside the card */}
      <div style={{
        position: "absolute", top: 0, right: 0, width: 250, height: 250,
        background: "rgba(0,240,255,0.05)", borderRadius: "50%", filter: "blur(80px)",
        pointerEvents: "none"
      }} />

      <h3 className="space-grotesk text-sm sm:text-lg font-bold text-white mb-5 flex items-center gap-2.5 relative z-10">
        <span style={{ width: 4, height: 16, background: "#00F0FF", borderRadius: 99 }}></span>
        Set your context
      </h3>

      <div style={{ position: "relative", zIndex: 10 }}>
        {/* Step 1 */}
        <div style={{ marginBottom: 16 }}>
          <p className="font-inter text-[12px] lg:text-[14px] font-semibold tracking-[0.05em] text-[#00f0ff] pl-2 uppercase mb-1.5">
            Step 1 — Select Your Industry
          </p>
          <div>
            <Select onValueChange={setIndustry}>
              <SelectTrigger style={{ background: "#0F111A", border: "1px solid rgba(255,255,255,0.1)", color: "#FFFFFF", height: 40, borderRadius: 8 }} className="text-xs sm:text-sm">
                <SelectValue placeholder={t('dynamic.dyn_selectindustry_86')} />
              </SelectTrigger>
              <SelectContent style={{ background: "#1E212B", border: "1px solid rgba(255,255,255,0.1)", color: "#FFFFFF" }}>
                {industries.map((item) => (
                  <SelectItem key={item.value} value={item.value} style={{ cursor: "pointer", fontSize: 14 }} className="focus:bg-brand-cyan focus:text-[#0F111A]/10 focus:text-white">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ marginBottom: 16 }}>
          <p className="font-inter text-[12px] lg:text-[14px] font-semibold tracking-[0.05em] text-[#00f0ff] pl-2 uppercase mb-1.5">
            Step 2 — Define your management level
          </p>
          <div>
            <Select onValueChange={setManagementLevel}>
              <SelectTrigger style={{ background: "#0F111A", border: "1px solid rgba(255,255,255,0.1)", color: "#FFFFFF", height: 40, borderRadius: 8 }} className="text-xs sm:text-sm">
                <SelectValue placeholder={t('dynamic.dyn_selectlevel_87')} />
              </SelectTrigger>
              <SelectContent style={{ background: "#1E212B", border: "1px solid rgba(255,255,255,0.1)", color: "#FFFFFF" }}>
                {managementLevels.map((item) => (
                  <SelectItem key={item.value} value={item.value} style={{ cursor: "pointer", fontSize: 14 }} className="focus:bg-brand-cyan focus:text-[#0F111A]/10 focus:text-white">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ marginBottom: 20 }}>
          <p className="font-inter text-[12px] lg:text-[14px] font-semibold tracking-[0.05em] text-[#00f0ff] pl-2 uppercase mb-1.5">
            Step 3 — Choose your department or function
          </p>
          <div>
            <Select onValueChange={setDepartment}>
              <SelectTrigger style={{ background: "#0F111A", border: "1px solid rgba(255,255,255,0.1)", color: "#FFFFFF", height: 40, borderRadius: 8 }} className="text-xs sm:text-sm">
                <SelectValue placeholder={t('dynamic.dyn_selectdepartment_88')} />
              </SelectTrigger>
              <SelectContent style={{ background: "#1E212B", border: "1px solid rgba(255,255,255,0.1)", color: "#FFFFFF" }}>
                {departments.map((item) => (
                  <SelectItem key={item.value} value={item.value} style={{ cursor: "pointer", fontSize: 14 }} className="focus:bg-brand-cyan focus:text-[#0F111A]/10 focus:text-white">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          style={{
            width: "100%", height: 42, borderRadius: 8, fontSize: 13, fontWeight: 700,
            background: isDisabled ? "#00f0ff" : "#00F0FF",
            color: isDisabled ? "#0F111A" : "black",
            border: "none", cursor: isDisabled ? "not-allowed" : "pointer",
            transition: "all 0.2s"
          }}
          disabled={isDisabled}
          onClick={handleSubmit}
        >
          {displayButtonText}
        </Button>
      </div>
    </div>
  );
}
