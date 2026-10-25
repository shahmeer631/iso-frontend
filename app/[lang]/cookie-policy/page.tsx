import { Metadata } from "next";
import CookiePolicyClient from "@/app/[lang]/cookie-policy/CookiePolicyClient";

export const metadata: Metadata = {
  title: "Cookie Policy | ISOBrain.AI",
  description:
    "Learn how ISOBrain uses cookies and similar technologies on our website, student dashboard, and AI services, and how you can manage them.",
};

export default function CookiePolicy() {
  return <CookiePolicyClient />;
}
