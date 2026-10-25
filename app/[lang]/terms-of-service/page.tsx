import { Metadata } from "next";
import TermsOfServiceClient from "@/app/[lang]/terms-of-service/TermsOfServiceClient";

export const metadata: Metadata = {
  title: "Terms of Service | ISOBrain.AI",
  description:
    "Read the ISOBrain.AI Terms of Service covering accounts, subscriptions, AI outputs, acceptable use, intellectual property, and liability.",
};

export default function TermsOfService() {
  return <TermsOfServiceClient />;
}
