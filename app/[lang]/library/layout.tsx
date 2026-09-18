import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ISO Standards Platform | Access ISO Documents & Clauses",
  description: "Browse ISO standards, clauses, and frameworks in one place. Search, navigate, and understand ISO requirements faster with AI-assisted ISO compliance tools.",
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
