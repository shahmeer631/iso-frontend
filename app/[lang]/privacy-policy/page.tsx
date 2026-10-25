import { Metadata } from "next";
import PrivacyPolicyClient from "@/app/[lang]/privacy-policy/PrivacyPolicyClient";

export const metadata: Metadata = {
  title: "Privacy Policy | ISOBrain.AI",
  description:
    "Learn how ISOBrain collects, uses, shares, and protects your personal information when you use our website, AI tools, and student dashboard.",
};

export default function PrivacyPolicy() {
  return <PrivacyPolicyClient />;
}
