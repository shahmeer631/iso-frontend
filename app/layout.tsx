import type { Metadata } from "next";
import localFont from "next/font/local";
import ClientWrapper from "@/components/layout/ClientWrapper";
import "./globals.css";

/**
 * Space Grotesk approximates Sprizzy's Founders Grotesk (commercial) —
 * same grotesk family feel: clean, bold headings, readable body.
 * Self-hosted to avoid next/font/google Turbopack build failures.
 */
const spaceGrotesk = localFont({
  src: [
    {
      path: "./fonts/space-grotesk-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/space-grotesk-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/space-grotesk-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/space-grotesk-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "ISO Compliance Software | AI-Powered Audit & Management",
  description:
    "Manage standards, audits, and compliance in one ISO compliance platform. ISOBrain combines AI tools with structured workflows to simplify ISO management.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/isobrain-favicon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning className={spaceGrotesk.variable}>
      <body className={`${spaceGrotesk.className} font-sans antialiased`} suppressHydrationWarning>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
