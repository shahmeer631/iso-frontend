import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | ISOBrain Compliance Platform",
  description: "Access your ISOBrain account to manage ISO standards, audits, and compliance workflows.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
