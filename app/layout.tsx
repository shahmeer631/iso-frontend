import type { Metadata } from "next";
import ClientWrapper from "@/components/layout/ClientWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "ISO Compliance Software | AI-Powered Audit & Management",
  description: "Manage standards, audits, and compliance in one ISO compliance platform. ISOBrain combines AI tools with structured workflows to simplify ISO management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body className="font-inter" suppressHydrationWarning>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
