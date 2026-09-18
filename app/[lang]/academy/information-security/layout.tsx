import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Information Security Courses | ISO 27001 Training",
  description: "Master information security management with ISO 27001 courses. Learn how to implement, manage, and audit security systems effectively.",
};

export default function InformationSecurityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
