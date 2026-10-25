"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Baby,
  Database,
  FilePenLine,
  Mail,
  RefreshCw,
  Scale,
  Share2,
  Shield,
  ShieldCheck,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const TOC = [
  { id: "information-we-collect", label: "1. Information We Collect" },
  { id: "how-we-use", label: "2. How We Use Your Information" },
  { id: "how-we-share", label: "3. How We Share Your Information" },
  { id: "data-security", label: "4. Data Security" },
  { id: "data-rights", label: "5. Your Data Rights & Choices" },
  { id: "childrens-privacy", label: "6. Children’s Privacy" },
  { id: "policy-changes", label: "7. Changes to This Privacy Policy" },
  { id: "contact-us", label: "8. Contact Us" },
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

const sectionCard =
  "ib-card scroll-mt-28 overflow-hidden p-6 sm:p-8";
const bodyText =
  "text-[15.5px] leading-[1.7] text-[var(--ib-mute)] sm:text-base";
const listClass =
  "list-disc space-y-2.5 pl-5 marker:text-[var(--ib-acc)]";
const linkClass =
  "font-medium text-[var(--ib-acc)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]";

export default function PrivacyPolicyClient() {
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
        {/* Hero */}
        <header className="mx-auto max-w-[760px] text-center">
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.45, ease }}
            className="ib-pill mx-auto border border-[color-mix(in_srgb,var(--ib-acc)_22%,var(--ib-line))]"
          >
            <Shield className="size-3.5 shrink-0" aria-hidden />
            Privacy
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
            Privacy Policy
          </motion.h1>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.5,
              delay: reduceMotion ? 0 : 0.12,
              ease,
            }}
            className={`mx-auto mt-5 max-w-[680px] space-y-4 text-left sm:text-center ${bodyText}`}
          >
            <p>
              Welcome to Isobrain (&quot;we,&quot; &quot;our,&quot; or
              &quot;us&quot;). We are committed to protecting your privacy and
              ensuring that your personal information is handled securely and
              responsibly. This Privacy Policy outlines how we collect, use,
              share, and protect your data when you visit our website
              (https://isobrain.ai/) and use our AI tools, student dashboard, and
              related services (collectively, the &quot;Services&quot;).
            </p>
            <p>
              By accessing or using Isobrain, you agree to the collection and use
              of information in accordance with this Privacy Policy.
            </p>
          </motion.div>
        </header>

        {/* TOC */}
        <motion.nav
          {...fadeUp(reduceMotion, 0.05)}
          aria-label="Privacy Policy sections"
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
            id="information-we-collect"
            {...fadeUp(reduceMotion, 0)}
            className={sectionCard}
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
                <Database className="size-5" aria-hidden />
              </span>
              <h2 className="mb-0! text-[22px] font-bold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[24px]">
                1. Information We Collect
              </h2>
            </div>
            <div className={`space-y-6 ${bodyText}`}>
              <p>
                We collect information directly from you, automatically through
                your use of our Services, and from third-party services.
              </p>

              <div>
                <h3 className="mb-3 text-[17px] font-semibold text-[var(--ib-acc)] sm:text-[18px]">
                  A. Information You Provide to Us
                </h3>
                <ul className={listClass}>
                  <li>
                    <strong className="text-[var(--ib-ink)]">
                      Account Information:
                    </strong>{" "}
                    When you register for a free trial or subscription, we
                    collect your name, email address, and login credentials.
                  </li>
                  <li>
                    <strong className="text-[var(--ib-ink)]">
                      Payment Information:
                    </strong>{" "}
                    If you upgrade to a paid package, your payment details
                    (credit card information, billing address) are collected and
                    processed securely by our third-party payment processor,
                    Stripe. We do not store your full credit card number on our
                    servers.
                  </li>
                  <li>
                    <strong className="text-[var(--ib-ink)]">
                      User Inputs &amp; AI Interactions:
                    </strong>{" "}
                    We collect the text, prompts, queries, and files you submit
                    to our AI tools via the student dashboard in order to
                    generate the requested outputs.
                  </li>
                  <li>
                    <strong className="text-[var(--ib-ink)]">
                      Communications:
                    </strong>{" "}
                    Information you provide when you contact our support team.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 text-[17px] font-semibold text-[var(--ib-acc)] sm:text-[18px]">
                  B. Information We Collect Automatically
                </h3>
                <ul className={listClass}>
                  <li>
                    <strong className="text-[var(--ib-ink)]">Usage Data:</strong>{" "}
                    We collect system logs detailing how you interact with our
                    platform, including login timestamps, features utilized, and
                    subscription status. (Note: This data may be used as proof of
                    service in the event of a billing dispute).
                  </li>
                  <li>
                    <strong className="text-[var(--ib-ink)]">
                      Device Information:
                    </strong>{" "}
                    We automatically record your IP address, browser type,
                    operating system, and device identifiers.
                  </li>
                  <li>
                    <strong className="text-[var(--ib-ink)]">
                      Cookies and Tracking Technologies:
                    </strong>{" "}
                    We use cookies to keep you logged in, remember your
                    preferences, and analyze site traffic.
                  </li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* 2 */}
          <motion.section
            id="how-we-use"
            {...fadeUp(reduceMotion, 0.03)}
            className={sectionCard}
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
                <FilePenLine className="size-5" aria-hidden />
              </span>
              <h2 className="mb-0! text-[22px] font-bold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[24px]">
                2. How We Use Your Information
              </h2>
            </div>
            <div className={`space-y-4 ${bodyText}`}>
              <p>We use the collected information for the following purposes:</p>
              <ul className={listClass}>
                <li>
                  <strong className="text-[var(--ib-ink)]">
                    To Provide and Maintain the Service:
                  </strong>{" "}
                  To operate your student dashboard, generate AI outputs based on
                  your prompts, and manage your subscription level.
                </li>
                <li>
                  <strong className="text-[var(--ib-ink)]">
                    Billing and Transactions:
                  </strong>{" "}
                  To process payments, manage your 7-day free trial conversions,
                  and prevent fraudulent transactions.
                </li>
                <li>
                  <strong className="text-[var(--ib-ink)]">
                    To Improve Our AI and Platform:
                  </strong>{" "}
                  To analyze usage trends, troubleshoot bugs, and enhance the
                  functionality of Isobrain. (We do not use your personal prompts
                  or private data to train our foundational AI models.)
                </li>
                <li>
                  <strong className="text-[var(--ib-ink)]">
                    To Communicate With You:
                  </strong>{" "}
                  To send transactional emails (e.g., password resets, trial
                  expiration warnings, billing receipts) and updates about new
                  Isobrain features.
                </li>
                <li>
                  <strong className="text-[var(--ib-ink)]">
                    Legal &amp; Security:
                  </strong>{" "}
                  To protect against unauthorized access, enforce our strictly No
                  Refund &amp; Cancellation Policy, and resolve disputes.
                </li>
              </ul>
            </div>
          </motion.section>

          {/* 3 */}
          <motion.section
            id="how-we-share"
            {...fadeUp(reduceMotion, 0.03)}
            className={sectionCard}
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
                <Share2 className="size-5" aria-hidden />
              </span>
              <h2 className="mb-0! text-[22px] font-bold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[24px]">
                3. How We Share Your Information
              </h2>
            </div>
            <div className={`space-y-4 ${bodyText}`}>
              <p>
                We do not sell your personal information to third parties. We
                only share your data in the following circumstances:
              </p>
              <ul className={listClass}>
                <li>
                  <strong className="text-[var(--ib-ink)]">
                    Service Providers:
                  </strong>{" "}
                  We share necessary data with trusted third parties who help us
                  operate our business, such as cloud hosting providers and our
                  payment processor (Stripe). These providers are bound by strict
                  data protection agreements.
                </li>
                <li>
                  <strong className="text-[var(--ib-ink)]">
                    AI Infrastructure Partners:
                  </strong>{" "}
                  Depending on the architecture of our AI, your inputs may be
                  processed by third-party language model APIs (e.g., OpenAI,
                  Anthropic). These partners are restricted from using your data
                  for their own independent purposes.
                </li>
                <li>
                  <strong className="text-[var(--ib-ink)]">
                    Legal Compliance:
                  </strong>{" "}
                  We may disclose your information if required to do so by law,
                  in response to a subpoena, or to protect the rights, property,
                  and safety of Isobrain, our users, or others (including sharing
                  system logs with Stripe and banks to contest unwarranted
                  chargebacks).
                </li>
              </ul>
            </div>
          </motion.section>

          {/* 4 */}
          <motion.section
            id="data-security"
            {...fadeUp(reduceMotion, 0.03)}
            className={sectionCard}
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
                <ShieldCheck className="size-5" aria-hidden />
              </span>
              <h2 className="mb-0! text-[22px] font-bold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[24px]">
                4. Data Security
              </h2>
            </div>
            <p className={bodyText}>
              We implement industry-standard security measures, including
              encryption and secure socket layer (SSL) technology, to protect
              your data during transmission and at rest. While we strive to
              protect your personal information, no method of transmission over
              the internet or electronic storage is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </motion.section>

          {/* 5 */}
          <motion.section
            id="data-rights"
            {...fadeUp(reduceMotion, 0.03)}
            className={sectionCard}
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
                <Scale className="size-5" aria-hidden />
              </span>
              <h2 className="mb-0! text-[22px] font-bold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[24px]">
                5. Your Data Rights &amp; Choices
              </h2>
            </div>
            <div className={`space-y-4 ${bodyText}`}>
              <p>
                Depending on your location (such as under the GDPR in Europe or
                CCPA in California), you may have the following rights regarding
                your data:
              </p>
              <ul className={listClass}>
                <li>
                  <strong className="text-[var(--ib-ink)]">
                    Access and Update:
                  </strong>{" "}
                  You can access and update your personal information directly
                  within your student dashboard.
                </li>
                <li>
                  <strong className="text-[var(--ib-ink)]">Cancellation:</strong>{" "}
                  You can cancel your subscription at any time via the bottom
                  section of your student dashboard or via your Stripe billing
                  portal.
                </li>
                <li>
                  <strong className="text-[var(--ib-ink)]">
                    Data Deletion:
                  </strong>{" "}
                  You may request the deletion of your account and associated
                  personal data by contacting us. Please note that we may retain
                  certain billing records as required by law or for dispute
                  resolution purposes.
                </li>
                <li>
                  <strong className="text-[var(--ib-ink)]">Opt-Out:</strong> You
                  may opt out of promotional emails by clicking the
                  &quot;unsubscribe&quot; link at the bottom of our emails. You
                  will still receive essential service and billing notices.
                </li>
              </ul>
            </div>
          </motion.section>

          {/* 6 */}
          <motion.section
            id="childrens-privacy"
            {...fadeUp(reduceMotion, 0.03)}
            className={sectionCard}
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
                <Baby className="size-5" aria-hidden />
              </span>
              <h2 className="mb-0! text-[22px] font-bold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[24px]">
                6. Children’s Privacy
              </h2>
            </div>
            <p className={bodyText}>
              Isobrain is intended for students and users who are at least 13
              years of age (or the minimum age of digital consent in your
              jurisdiction). We do not knowingly collect personal information
              from children under 13. If we become aware that a child under 13
              has provided us with personal data, we will take steps to delete
              such information immediately.
            </p>
          </motion.section>

          {/* 7 */}
          <motion.section
            id="policy-changes"
            {...fadeUp(reduceMotion, 0.03)}
            className={sectionCard}
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
                <RefreshCw className="size-5" aria-hidden />
              </span>
              <h2 className="mb-0! text-[22px] font-bold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[24px]">
                7. Changes to This Privacy Policy
              </h2>
            </div>
            <p className={bodyText}>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or legal requirements. We will notify you
              of any significant changes by posting the new policy on this page
              and updating the &quot;Effective Date.&quot;
            </p>
          </motion.section>

          {/* 8 */}
          <motion.section
            id="contact-us"
            {...fadeUp(reduceMotion, 0.03)}
            className={sectionCard}
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
                <Mail className="size-5" aria-hidden />
              </span>
              <h2 className="mb-0! text-[22px] font-bold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[24px]">
                8. Contact Us
              </h2>
            </div>
            <div className={`space-y-4 ${bodyText}`}>
              <p>
                If you have any questions, concerns, or requests regarding this
                Privacy Policy or your data, please contact us at:
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
