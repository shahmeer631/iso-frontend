"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Ban,
  Brain,
  CreditCard,
  FileText,
  Gavel,
  LayoutDashboard,
  Mail,
  RefreshCw,
  Scale,
  ScrollText,
  Shield,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const TOC = [
  { id: "description-of-service", label: "1. Description of Service" },
  { id: "account-registration", label: "2. Account Registration & Security" },
  { id: "subscriptions-billing", label: "3. Subscriptions, Billing, and Cancellations" },
  { id: "ai-output-disclaimer", label: "4. Artificial Intelligence & Output Disclaimer" },
  { id: "acceptable-use", label: "5. Acceptable Use Policy" },
  { id: "intellectual-property", label: "6. Intellectual Property Rights" },
  { id: "third-party-services", label: "7. Third-Party Services" },
  { id: "disclaimer-of-warranties", label: "8. Disclaimer of Warranties" },
  { id: "limitation-of-liability", label: "9. Limitation of Liability" },
  { id: "modifications", label: "10. Modifications to the Terms" },
  { id: "governing-law", label: "11. Governing Law" },
  { id: "contact-information", label: "12. Contact Information" },
] as const;

function fadeUp(reduceMotion: boolean | null, delay = 0) {
  return reduceMotion
    ? {
        initial: false as const,
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.12 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.12 },
        transition: { duration: 0.45, delay, ease },
      };
}

const sectionCard = "ib-card scroll-mt-28 overflow-hidden p-6 sm:p-8";
const bodyText =
  "text-[15.5px] leading-[1.7] text-[var(--ib-mute)] sm:text-base";
const listClass =
  "list-disc space-y-3 pl-5 marker:text-[var(--ib-acc)]";
const linkClass =
  "font-medium text-[var(--ib-acc)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]";
const legalCaps =
  "rounded-xl border border-[var(--ib-line)] bg-[var(--ib-bg)] p-4 text-[13px] uppercase leading-[1.75] tracking-[0.03em] text-[var(--ib-ink)] sm:p-5 sm:text-[13.5px]";

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

export default function TermsOfServiceClient() {
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
            <ScrollText className="size-3.5 shrink-0" aria-hidden />
            Legal
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
            Terms of Service
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
              &quot;us&quot;). These Terms of Service (&quot;Terms&quot;) govern
              your access to and use of our website (https://isobrain.ai/), the
              student dashboard, AI tools, and all related services
              (collectively, the &quot;Services&quot;).
            </p>
            <p>
              By creating an account, starting a free trial, or using our
              Services, you agree to be bound by these Terms. If you do not
              agree, please do not use Isobrain.
            </p>
          </motion.div>
        </header>

        <motion.nav
          {...fadeUp(reduceMotion, 0.05)}
          aria-label="Terms of Service sections"
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
          <motion.section
            id="description-of-service"
            {...fadeUp(reduceMotion, 0)}
            className={sectionCard}
          >
            <SectionHeading icon={LayoutDashboard}>
              1. Description of Service
            </SectionHeading>
            <p className={bodyText}>
              Isobrain provides AI-powered educational and productivity tools
              accessed via a web-based student dashboard. Our Services are
              designed to generate text, solve problems, and provide information
              based on user inputs (&quot;Prompts&quot;). The Services are
              continually evolving, and we may add, modify, or remove features at
              our discretion.
            </p>
          </motion.section>

          <motion.section
            id="account-registration"
            {...fadeUp(reduceMotion, 0.02)}
            className={sectionCard}
          >
            <SectionHeading icon={Shield}>
              2. Account Registration &amp; Security
            </SectionHeading>
            <ul className={`${listClass} ${bodyText}`}>
              <li>
                <strong className="text-[var(--ib-ink)]">Eligibility:</strong> You
                must be at least 13 years old (or the age of digital consent in
                your jurisdiction) to use our Services.
              </li>
              <li>
                <strong className="text-[var(--ib-ink)]">
                  Account Accuracy:
                </strong>{" "}
                You agree to provide accurate, current, and complete information
                during registration.
              </li>
              <li>
                <strong className="text-[var(--ib-ink)]">Security:</strong> You
                are responsible for safeguarding your password and account
                credentials. You agree to notify us immediately of any
                unauthorized use of your account. Isobrain is not liable for any
                losses caused by unauthorized access to your account.
              </li>
            </ul>
          </motion.section>

          <motion.section
            id="subscriptions-billing"
            {...fadeUp(reduceMotion, 0.02)}
            className={sectionCard}
          >
            <SectionHeading icon={CreditCard}>
              3. Subscriptions, Billing, and Cancellations
            </SectionHeading>
            <div className={`space-y-4 ${bodyText}`}>
              <p>
                By subscribing to a paid plan or entering a free trial, you agree
                to our strictly enforced billing policies:
              </p>
              <ul className={listClass}>
                <li>
                  <strong className="text-[var(--ib-ink)]">
                    7-Day Free Trial:
                  </strong>{" "}
                  We offer a 7-day free trial for new users. By providing your
                  payment information, you authorize our payment processor
                  (Stripe) to automatically charge you for your selected
                  subscription package immediately upon the trial&apos;s
                  expiration.
                </li>
                <li>
                  <strong className="text-[var(--ib-ink)]">
                    Strict No Refund Policy:
                  </strong>{" "}
                  All charges are 100% non-refundable. We do not provide refunds
                  or prorated credits for unused time, forgotten cancellations, or
                  mid-cycle terminations.
                </li>
                <li>
                  <strong className="text-[var(--ib-ink)]">Cancellations:</strong>{" "}
                  It is entirely your responsibility to manage your subscription.
                  You can cancel your trial or active subscription at any time
                  using one of two methods:
                  <ol className="mt-2 list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-[var(--ib-acc)]">
                    <li>
                      Via the bottom section of your Student Dashboard on
                      Isobrain.
                    </li>
                    <li>
                      Via the secure Stripe Subscription Page link provided to
                      you.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong className="text-[var(--ib-ink)]">
                    Post-Cancellation Access:
                  </strong>{" "}
                  If you cancel, you will not be billed again, but you will
                  retain full access to your availed package until the end of
                  your current billing cycle.
                </li>
                <li>
                  <strong className="text-[var(--ib-ink)]">Please note:</strong>{" "}
                  Disputing valid subscription charges with your bank after
                  failing to cancel via the provided methods constitutes a breach
                  of these Terms.
                </li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            id="ai-output-disclaimer"
            {...fadeUp(reduceMotion, 0.02)}
            className={sectionCard}
          >
            <SectionHeading icon={Brain}>
              4. Artificial Intelligence &amp; Output Disclaimer
            </SectionHeading>
            <div className={`space-y-4 ${bodyText}`}>
              <p>
                Due to the nature of machine learning and artificial
                intelligence, the outputs generated by Isobrain
                (&quot;Outputs&quot;) are not guaranteed to be accurate,
                complete, or reliable.
              </p>
              <ul className={listClass}>
                <li>
                  <strong className="text-[var(--ib-ink)]">
                    No Professional Advice:
                  </strong>{" "}
                  Isobrain is an educational tool. Outputs do not constitute
                  professional medical, legal, financial, or psychological
                  advice.
                </li>
                <li>
                  <strong className="text-[var(--ib-ink)]">Verification:</strong>{" "}
                  You are solely responsible for evaluating the accuracy and
                  appropriateness of any Output before relying on it or sharing
                  it.
                </li>
                <li>
                  <strong className="text-[var(--ib-ink)]">
                    Similar Outputs:
                  </strong>{" "}
                  You acknowledge that AI may generate the same or similar
                  Outputs for other Isobrain users who enter similar Prompts.
                </li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            id="acceptable-use"
            {...fadeUp(reduceMotion, 0.02)}
            className={sectionCard}
          >
            <SectionHeading icon={Ban}>5. Acceptable Use Policy</SectionHeading>
            <div className={`space-y-4 ${bodyText}`}>
              <p>You agree not to use Isobrain to:</p>
              <ul className={`${listClass} mb-0 space-y-2`}>
                <li>
                  Generate, promote, or distribute illegal, violent, harmful, or
                  sexually explicit content.
                </li>
                <li>Harass, bully, defame, or discriminate against others.</li>
                <li>
                  Generate malware, spam, or engage in deceptive practices (e.g.,
                  phishing).
                </li>
                <li>
                  Attempt to reverse-engineer, decompile, or scrape the Isobrain
                  platform or its underlying AI models.
                </li>
                <li>
                  Bypass or manipulate subscription limits, API rate limits, or
                  platform security features.
                </li>
                <li>
                  Infringe upon the intellectual property rights of any third
                  party.
                </li>
              </ul>
              <p>
                We reserve the right to suspend or terminate your account
                immediately, without notice or refund, if you violate this
                Acceptable Use Policy.
              </p>
            </div>
          </motion.section>

          <motion.section
            id="intellectual-property"
            {...fadeUp(reduceMotion, 0.02)}
            className={sectionCard}
          >
            <SectionHeading icon={Sparkles}>
              6. Intellectual Property Rights
            </SectionHeading>
            <ul className={`${listClass} ${bodyText}`}>
              <li>
                <strong className="text-[var(--ib-ink)]">Our Property:</strong>{" "}
                Isobrain owns all rights, title, and interest in the platform,
                the student dashboard, original website content, branding, and
                underlying software.
              </li>
              <li>
                <strong className="text-[var(--ib-ink)]">
                  Your Inputs and Outputs:
                </strong>{" "}
                To the extent permitted by law, you retain ownership of the
                Prompts you input into the Service. Isobrain claims no ownership
                over the Outputs generated specifically for you, allowing you to
                use them for your personal or commercial educational purposes,
                provided they comply with these Terms.
              </li>
            </ul>
          </motion.section>

          <motion.section
            id="third-party-services"
            {...fadeUp(reduceMotion, 0.02)}
            className={sectionCard}
          >
            <SectionHeading icon={FileText}>
              7. Third-Party Services
            </SectionHeading>
            <p className={bodyText}>
              Isobrain utilizes third-party services, such as Stripe for payment
              processing and external cloud/AI infrastructure providers. Your
              interactions with these third parties are governed by their
              respective Terms of Service and Privacy Policies. Isobrain is not
              responsible for the availability or performance of these external
              services.
            </p>
          </motion.section>

          <motion.section
            id="disclaimer-of-warranties"
            {...fadeUp(reduceMotion, 0.02)}
            className={sectionCard}
          >
            <SectionHeading icon={AlertTriangle}>
              8. Disclaimer of Warranties
            </SectionHeading>
            <p className={legalCaps}>
              ISOBRAIN IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS
              AVAILABLE&quot; BASIS. WE DISCLAIM ALL WARRANTIES, WHETHER EXPRESS
              OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS
              FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT GUARANTEE
              THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE FROM
              HARMFUL COMPONENTS.
            </p>
          </motion.section>

          <motion.section
            id="limitation-of-liability"
            {...fadeUp(reduceMotion, 0.02)}
            className={sectionCard}
          >
            <SectionHeading icon={Scale}>
              9. Limitation of Liability
            </SectionHeading>
            <p className={legalCaps}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL ISOBRAIN,
              ITS FOUNDERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
              PROFITS, DATA, OR GOODWILL RESULTING FROM (A) YOUR USE OF OR
              INABILITY TO USE THE SERVICE; (B) ANY INACCURATE OUTPUT GENERATED
              BY THE AI; OR (C) UNAUTHORIZED ACCESS TO YOUR ACCOUNT. IN NO EVENT
              SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID TO ISOBRAIN IN
              THE PAST 12 MONTHS.
            </p>
          </motion.section>

          <motion.section
            id="modifications"
            {...fadeUp(reduceMotion, 0.02)}
            className={sectionCard}
          >
            <SectionHeading icon={RefreshCw}>
              10. Modifications to the Terms
            </SectionHeading>
            <p className={bodyText}>
              We reserve the right to modify these Terms at any time. If we make
              material changes, we will provide notice by updating the
              &quot;Effective Date&quot; at the top of this page or by sending an
              email to registered users. Your continued use of Isobrain after
              changes are published constitutes your acceptance of the new Terms.
            </p>
          </motion.section>

          <motion.section
            id="governing-law"
            {...fadeUp(reduceMotion, 0.02)}
            className={sectionCard}
          >
            <SectionHeading icon={Gavel}>11. Governing Law</SectionHeading>
            <p className={bodyText}>
              These Terms shall be governed and construed in accordance with the
              laws of the United Arab Emirates, without regard to its conflict of
              law provisions.
            </p>
          </motion.section>

          <motion.section
            id="contact-information"
            {...fadeUp(reduceMotion, 0.02)}
            className={sectionCard}
          >
            <SectionHeading icon={Mail}>12. Contact Information</SectionHeading>
            <div className={`space-y-4 ${bodyText}`}>
              <p>
                If you have any questions about these Terms, please contact us
                at:
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
