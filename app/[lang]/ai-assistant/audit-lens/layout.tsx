import { Metadata } from "next";
import AssistantStepsBanner from "@/components/api-usage/AssistantStepsBanner";

export const metadata: Metadata = {
  title: "ISO Audit Software | AI Audit & Compliance Analysis",
  description:
    "Identify non-conformities and review ISO documentation faster. AI-powered audit tools for compliance officers, auditors, and teams.",
};

export default function AuditLensLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AssistantStepsBanner />
      {children}
    </>
  );
}
