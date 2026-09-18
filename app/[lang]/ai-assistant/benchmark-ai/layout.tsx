import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ISO Gap Analysis Tool | AI Benchmarking Software",
  description: "Compare your processes against ISO standards and uncover compliance gaps. Automated benchmarking powered by AI.",
};

export default function BenchmarkAiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
