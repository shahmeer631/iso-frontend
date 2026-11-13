import { Metadata } from "next";
import AssistantStepsBanner from "@/components/api-usage/AssistantStepsBanner";

export const metadata: Metadata = {
  title: "ISO Clause Search Tool | AI ISO Navigator",
  description:
    "Search and interpret ISO clauses instantly. Navigate complex standards with an AI-powered ISO compliance assistant.",
};

export default function NavigatorLayout({
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
