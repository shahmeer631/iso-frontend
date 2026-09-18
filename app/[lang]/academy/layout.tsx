import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ISO Training Courses | Learn ISO 9001, 27001 & More",
  description: "Learn ISO standards through structured courses and AI tools. Build real-world knowledge across ISO 9001, ISO 27001, and more.",
};

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
