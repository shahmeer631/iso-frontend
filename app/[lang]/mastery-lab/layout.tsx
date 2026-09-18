import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ISO Assessment Tool | Test Your Compliance Knowledge",
  description: "Assess your ISO knowledge with AI-driven evaluations. Identify gaps and improve your compliance skills in minutes.",
};

export default function AssessmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
