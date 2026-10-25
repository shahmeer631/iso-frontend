"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Cookie,
  Gauge,
  Globe,
  Mail,
  RefreshCw,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const TOC = [
  { id: "what-are-cookies", label: "1. What Are Cookies?" },
  { id: "how-we-use-cookies", label: "2. How We Use Cookies" },
  { id: "manage-cookies", label: "3. How to Manage and Control Cookies" },
  { id: "policy-updates", label: "4. Updates to This Cookie Policy" },
  { id: "contact-us", label: "5. Contact Us" },
] as const;

function fadeUp(reduceMotion: boolean | null, delay = 0) {
  return reduceMotion
    ? {
        initial: false as const,
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.15 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.15 },
        transition: { duration: 0.45, delay, ease },
      };
}

const sectionCard = "ib-card scroll-mt-28 overflow-hidden p-6 sm:p-8";
const bodyText =
  "text-[15.5px] leading-[1.7] text-[var(--ib-mute)] sm:text-base";
const listClass =
  "list-disc space-y-2.5 pl-5 marker:text-[var(--ib-acc)]";
const linkClass =
  "font-medium text-[var(--ib-acc)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]";
const categoryCard =
  "rounded-xl border border-[var(--ib-line)] bg-[var(--ib-bg)] p-4 sm:p-5";

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
        <Icon className="size-5" aria-hidden />
      </span>
      <h2 className="mb-0! text-[22px] font-bold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[24px]">
        {children}
      </h2>
    </div>
  );
}

export default function CookiePolicyClient() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[var(--ib-bg)] text-[var(--ib-ink)] selection:bg-[color-mix(in_srgb,var(--ib-acc)_22%,transparent)]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--ib-acc)_14%,transparent),transparent_68%)] blur-2xl motion-safe:animate-[hero-glow_12s_ease-in-out_infinite_alternate]" />
        <div
          className="absolute inset-0 opacity-[0.28]"
          style={{
            backgroundImage:
              "linear-gradient(var(--ib-line) 1px, transparent 1px), linear-gradient(90deg, var(--ib-line) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse 70% 50% at 50% 18%, black 10%, transparent 72%)",
          }}
        />
      </div>

      <div className="ib-w relative z-[1] pt-[96px] pb-20 sm:pb-24 lg:pb-28">
        <header className="mx-auto max-w-[760px] text-center">
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.45, ease }}
            className="ib-pill mx-auto border border-[color-mix(in_srgb,var(--ib-acc)_22%,var(--ib-line))]"
          >
            <Cookie className="size-3.5 shrink-0" aria-hidden />
            Cookies
          </motion.span>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.5,
              delay: reduceMotion ? 0 : 0.06,
              ease,
            }}
            className="mt-5 mb-0! text-[36px] font-bold leading-[1.12] tracking-[-0.035em] text-[var(--ib-ink)] sm:text-[44px] lg:text-[50px]"
          >
            Cookie Policy
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.5,
              delay: reduceMotion ? 0 : 0.12,
              ease,
            }}
            className={`mx-auto mt-5 max-w-[680px] text-left sm:text-center ${bodyText}`}
          >
            This Cookie Policy explains how Isobrain (&quot;we,&quot;
            &quot;us,&quot; or &quot;our&quot;) uses cookies and similar tracking
            technologies when you visit our website (https://isobrain.ai/), use
            our student dashboard, and interact with our AI Services. This policy
            explains what these technologies are, why we use them, and your
            rights to control our use of them.
          </motion.p>
        </header>

        <motion.nav
          {...fadeUp(reduceMotion, 0.05)}
          aria-label="Cookie Policy sections"
          className="mx-auto mt-10 max-w-[760px]"
        >
          <div className="ib-card overflow-hidden p-5 sm:p-6">
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--ib-acc)]">
              On this page
            </p>
            <ol className="grid list-none grid-cols-1 gap-2 sm:grid-cols-2">
              {TOC.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="flex items-center gap-2 rounded-xl border border-transparent px-3 py-2.5 text-left text-[14px] font-medium text-[var(--ib-ink)] transition-colors hover:border-[color-mix(in_srgb,var(--ib-acc)_25%,var(--ib-line))] hover:bg-[var(--ib-accbg)] hover:text-[var(--ib-acc)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
                  >
                    <span
                      aria-hidden
                      className="size-1.5 shrink-0 rounded-full bg-[var(--ib-acc)]"
                    />
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </motion.nav>

        <div className="mx-auto mt-8 max-w-[760px] space-y-5 sm:mt-10 sm:space-y-6">
          {/* 1 */}
          <motion.section
            id="what-are-cookies"
            {...fadeUp(reduceMotion, 0)}
            className={sectionCard}
          >
            <SectionHeading icon={Cookie}>1. What Are Cookies?</SectionHeading>
            <div className={`space-y-4 ${bodyText}`}>
              <p>
                Cookies are small data files that are placed on your computer or
                mobile device when you visit a website. They are widely used by
                online service providers to facilitate and help make websites
                work efficiently, enhance security, and provide reporting
                information.
              </p>
              <ul className={listClass}>
                <li>
                  <strong className="text-[var(--ib-ink)]">
                    First-party cookies:
                  </strong>{" "}
                  Cookies set by the website owner (Isobrain).
                </li>
                <li>
                  <strong className="text-[var(--ib-ink)]">
                    Third-party cookies:
                  </strong>{" "}
                  Cookies set by parties other than the website owner (such as
                  our payment processor, Stripe, or analytics providers).
                </li>
              </ul>
            </div>
          </motion.section>

          {/* 2 */}
          <motion.section
            id="how-we-use-cookies"
            {...fadeUp(reduceMotion, 0.03)}
            className={sectionCard}
          >
            <SectionHeading icon={SlidersHorizontal}>
              2. How We Use Cookies
            </SectionHeading>
            <div className={`space-y-5 ${bodyText}`}>
              <p>
                We use first-party and third-party cookies for several reasons.
                Some cookies are strictly necessary for our platform to operate,
                especially regarding user authentication and secure billing. We
                classify our cookies into the following categories:
              </p>

              <div className={categoryCard}>
                <h3 className="mb-2.5 flex items-center gap-2 text-[17px] font-semibold text-[var(--ib-acc)] sm:text-[18px]">
                  <ShieldCheck className="size-4 shrink-0" aria-hidden />
                  A. Essential (Strictly Necessary) Cookies
                </h3>
                <p className="mb-3">
                  These cookies are critical to the core operation of Isobrain.
                  They cannot be disabled in our systems. We rely on them to:
                </p>
                <ul className={listClass}>
                  <li>
                    Keep you securely logged into your Student Dashboard.
                  </li>
                  <li>
                    Maintain your session state as you interact with our AI
                    tools.
                  </li>
                  <li>
                    Process secure subscription transactions through our payment
                    gateway (Stripe).
                  </li>
                  <li>
                    Remember your agreement to our Terms of Service and No Refund
                    Policy during checkout.
                  </li>
                </ul>
              </div>

              <div className={categoryCard}>
                <h3 className="mb-2.5 flex items-center gap-2 text-[17px] font-semibold text-[var(--ib-acc)] sm:text-[18px]">
                  <Gauge className="size-4 shrink-0" aria-hidden />
                  B. Performance and Analytics Cookies
                </h3>
                <p className="mb-3">
                  These cookies collect information about how you use our
                  website, such as which pages you visit most often or if you
                  encounter error messages. They help us understand site traffic
                  and usage patterns so we can improve the Isobrain experience.
                </p>
                <ul className={listClass}>
                  <li>
                    Note: This data is aggregated and does not personally
                    identify you.
                  </li>
                </ul>
              </div>

              <div className={categoryCard}>
                <h3 className="mb-2.5 flex items-center gap-2 text-[17px] font-semibold text-[var(--ib-acc)] sm:text-[18px]">
                  <Settings2 className="size-4 shrink-0" aria-hidden />
                  C. Functionality Cookies
                </h3>
                <p>
                  These cookies allow our website to remember choices you make
                  (such as your preferred language, region, or visual preferences)
                  and provide enhanced, more personal features.
                </p>
              </div>

              <div className={categoryCard}>
                <h3 className="mb-2.5 flex items-center gap-2 text-[17px] font-semibold text-[var(--ib-acc)] sm:text-[18px]">
                  <Globe className="size-4 shrink-0" aria-hidden />
                  D. Third-Party Cookies
                </h3>
                <p className="mb-3">
                  In some cases, we use cookies provided by trusted third
                  parties.
                </p>
                <ul className={listClass}>
                  <li>
                    <strong className="text-[var(--ib-ink)]">Stripe:</strong> Our
                    payment processor uses essential cookies to ensure fraud
                    prevention, manage your 7-day free trial, and facilitate
                    secure recurring billing.
                  </li>
                  <li>
                    <strong className="text-[var(--ib-ink)]">
                      Analytics Providers:
                    </strong>{" "}
                    We may use services like Google Analytics to help us
                    understand how users engage with our site.
                  </li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* 3 */}
          <motion.section
            id="manage-cookies"
            {...fadeUp(reduceMotion, 0.03)}
            className={sectionCard}
          >
            <SectionHeading icon={Settings2}>
              3. How to Manage and Control Cookies
            </SectionHeading>
            <div className={`space-y-4 ${bodyText}`}>
              <p>
                You have the right to decide whether to accept or reject cookies.
                While you cannot opt out of Essential Cookies (as they are
                required to provide the service), you can manage your preferences
                for other types of cookies.
              </p>
              <ul className={`${listClass} space-y-4`}>
                <li>
                  <strong className="text-[var(--ib-ink)]">
                    Browser Settings:
                  </strong>{" "}
                  You can set or amend your web browser controls to accept or
                  refuse cookies. If you choose to reject cookies, you may still
                  use our website, but your access to certain functionality (like
                  maintaining an active login session on the dashboard) may be
                  severely restricted.
                </li>
                <li>
                  To learn how to manage cookies on popular browsers, visit:
                  <ul className="mt-2 list-[circle] space-y-1.5 pl-5">
                    <li>
                      <a
                        href="https://support.google.com/chrome/answer/95647"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        Google Chrome
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        Apple Safari
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        Mozilla Firefox
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        Microsoft Edge
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* 4 */}
          <motion.section
            id="policy-updates"
            {...fadeUp(reduceMotion, 0.03)}
            className={sectionCard}
          >
            <SectionHeading icon={RefreshCw}>
              4. Updates to This Cookie Policy
            </SectionHeading>
            <div className={`space-y-4 ${bodyText}`}>
              <p>
                We may update this Cookie Policy from time to time in order to
                reflect changes to the cookies we use or for other operational,
                legal, or regulatory reasons. Please revisit this Cookie Policy
                regularly to stay informed about our use of cookies and related
                technologies.
              </p>
              <p>
                The date at the top of this Cookie Policy indicates when it was
                last updated.
              </p>
            </div>
          </motion.section>

          {/* 5 */}
          <motion.section
            id="contact-us"
            {...fadeUp(reduceMotion, 0.03)}
            className={sectionCard}
          >
            <SectionHeading icon={Mail}>5. Contact Us</SectionHeading>
            <div className={`space-y-4 ${bodyText}`}>
              <p>
                If you have any questions about our use of cookies or other
                technologies, please contact us at:
              </p>
              <ul className="space-y-3">
                <li className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-[var(--ib-line)] bg-[var(--ib-bg)] px-4 py-3">
                  <strong className="text-[var(--ib-ink)]">Email:</strong>
                  <a href="mailto:hello@isobrain.ai" className={linkClass}>
                    hello@isobrain.ai
                  </a>
                </li>
                <li className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-[var(--ib-line)] bg-[var(--ib-bg)] px-4 py-3">
                  <strong className="text-[var(--ib-ink)]">Website:</strong>
                  <a
                    href="https://isobrain.ai/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    https://isobrain.ai/
                  </a>
                </li>
              </ul>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
