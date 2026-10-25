import { Metadata } from "next";
import RefundCancellationClient from "@/app/[lang]/refund-and-cancellation/RefundCancellationClient";

export const metadata: Metadata = {
  title: "No Refund & Cancellation Policy | ISOBrain.AI",
  description:
    "ISOBrain.AI No Refund and Cancellation Policy. Review refund terms, free trial billing, cancellation methods, continued access, and chargeback rules.",
};

export default function RefundCancellationPolicy() {
  return <RefundCancellationClient />;
}
