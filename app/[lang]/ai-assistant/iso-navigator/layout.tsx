import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ISO Clause Search Tool | AI ISO Navigator",
  description: "Search and interpret ISO clauses instantly. Navigate complex standards with an AI-powered ISO compliance assistant.",
};

export default function NavigatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
