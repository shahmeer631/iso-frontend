import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientWrapper from "@/components/layout/ClientWrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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
    <html suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
