import AboutClient from "@/app/[lang]/about/AboutClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About ISOBrain | AI-Powered ISO Compliance Software",
  description: "Learn how ISOBrain helps teams manage ISO compliance with AI-driven tools, structured workflows, and practical training built for real-world use.",
};

export default function AboutPage() {
  return <AboutClient />;
}
