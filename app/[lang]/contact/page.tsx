import ContactSection from "@/components/contact/contactForm";
import GetInTouchWithForm from "@/components/contact/contactTopSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact ISOBrain | Get in Touch",
  description:
    "Have questions about ISOBrain? Send a message or reach our team by email, phone, or office location.",
};

export default function ContactPage() {
  return (
    <div className="bg-[var(--ib-bg)] text-[var(--ib-ink)]">
      <GetInTouchWithForm />
      <ContactSection />
    </div>
  );
}
