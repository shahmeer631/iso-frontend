"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Ban,
  CalendarClock,
  CreditCard,
  ShieldAlert,
  XCircle,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const TOC = [
  { id: "strictly-no-refunds", label: "1. Strictly No Refunds" },
  { id: "free-trial-billing", label: "2. 7-Day Free Trial & Automatic Billing" },
  { id: "how-to-cancel", label: "3. How to Cancel Your Subscription" },
  { id: "continued-access", label: "4. Continued Access After Cancellation" },
  { id: "chargebacks", label: "5. Chargebacks and Bank Disputes" },
] as const;

function fadeUp(reduceMotion: boolean | null, delay = 0) {
  return reduceMotion
    ? {
        initial: false as const,
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.45, delay, ease },
      };
}

export default function RefundCancellationClient() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[var(--ib-bg)] text-[var(--ib-ink)] selection:bg-[color-mix(in_srgb,var(--ib-acc)_22%,transparent)]">
      {/* Ambient background */}
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
            <Ban className="size-3.5 shrink-0" aria-hidden />
            Policy
          </motion.span>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.5,
              delay: reduceMotion ? 0 : 0.06,
              ease,
            }}
            className="mt-5 mb-0! text-[32px] font-bold leading-[1.15] tracking-[-0.035em] text-[var(--ib-ink)] sm:text-[40px] lg:text-[46px]"
          >
            ISOBrain.AI No Refund &amp; Cancellation Policy
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.5,
              delay: reduceMotion ? 0 : 0.12,
              ease,
            }}
            className="mx-auto mt-5 max-w-[640px] text-[16px] leading-[1.7] text-[var(--ib-mute)] sm:text-[17px]"
          >
            By accessing, signing up for a free trial, or purchasing a
            subscription on Isobrain (https://isobrain.ai/), you acknowledge and
            agree to the following No Refund and Cancellation Policy.
          </motion.p>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.45,
              delay: reduceMotion ? 0 : 0.18,
              ease,
            }}
            className="mx-auto mt-4 inline-flex max-w-full items-center gap-2 rounded-xl border border-[color-mix(in_srgb,#DC2626_28%,var(--ib-line))] bg-[color-mix(in_srgb,#DC2626_8%,var(--ib-card))] px-4 py-2.5 text-[14px] font-bold text-[#B91C1C]"
            role="note"
          >
            <AlertTriangle className="size-4 shrink-0" aria-hidden />
            This policy is strictly enforced.
          </motion.p>
        </header>

        {/* Table of contents */}
        <motion.nav
          {...fadeUp(reduceMotion, 0.05)}
          aria-label="Policy sections"
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

        {/* Policy sections */}
        <div className="mx-auto mt-8 max-w-[760px] space-y-5 sm:mt-10 sm:space-y-6">
          {/* 1 */}
          <motion.section
            id="strictly-no-refunds"
            {...fadeUp(reduceMotion, 0)}
            className="ib-card scroll-mt-28 overflow-hidden p-6 sm:p-8"
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,#DC2626_22%,var(--ib-line))] bg-[color-mix(in_srgb,#DC2626_8%,var(--ib-card))] text-[#B91C1C]">
                <XCircle className="size-5" aria-hidden />
              </span>
              <h2 className="mb-0! text-[22px] font-bold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[24px]">
                1. Strictly No Refunds
              </h2>
            </div>
            <div className="space-y-4 text-[15.5px] leading-[1.7] text-[var(--ib-mute)] sm:text-base">
              <p>
                All subscription charges are 100% non-refundable once processed.
                We do not offer refunds, partial refunds, or prorated refunds for
                any active subscription or unused time, regardless of whether you
                have logged in or utilized the services during the billing period.
              </p>
              <p className="font-semibold text-[var(--ib-ink)]">
                This strict no-refund policy applies to:
              </p>
              <ul className="list-disc space-y-2.5 pl-5 marker:text-[var(--ib-acc)]">
                <li>
                  Charges processed immediately after the expiration of the 7-day
                  free trial.
                </li>
                <li>
                  Charges processed for subsequent monthly or annual recurring
                  billing cycles.
                </li>
              </ul>
            </div>
          </motion.section>

          {/* 2 */}
          <motion.section
            id="free-trial-billing"
            {...fadeUp(reduceMotion, 0.04)}
            className="ib-card scroll-mt-28 overflow-hidden p-6 sm:p-8"
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
                <CalendarClock className="size-5" aria-hidden />
              </span>
              <h2 className="mb-0! text-[22px] font-bold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[24px]">
                2. 7-Day Free Trial & Automatic Billing
              </h2>
            </div>
            <div className="space-y-4 text-[15.5px] leading-[1.7] text-[var(--ib-mute)] sm:text-base">
              <p>
                We offer a 7-day free trial for new users to evaluate our
                platform. By entering your payment information to start the free
                trial, you authorize Isobrain to automatically charge your payment
                method at the end of the 7-day period for the subscription package
                you selected (details available at{" "}
                <a
                  href="https://isobrain.ai/pricing"
                  className="font-medium text-[var(--ib-acc)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
                >
                  https://isobrain.ai/pricing
                </a>
                ).
              </p>
              <p>
                It is solely the customer&apos;s responsibility to cancel the
                trial before the 7 days expire if they do not wish to be charged.
                Claims of &quot;forgetting to cancel,&quot; &quot;not realizing
                the trial was ending,&quot; or &quot;being unaware of the
                cancellation policy&quot; are not valid grounds for a refund.
              </p>
            </div>
          </motion.section>

          {/* 3 */}
          <motion.section
            id="how-to-cancel"
            {...fadeUp(reduceMotion, 0.04)}
            className="ib-card scroll-mt-28 overflow-hidden p-6 sm:p-8"
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
                <CreditCard className="size-5" aria-hidden />
              </span>
              <h2 className="mb-0! text-[22px] font-bold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[24px]">
                3. How to Cancel Your Subscription
              </h2>
            </div>
            <div className="space-y-4 text-[15.5px] leading-[1.7] text-[var(--ib-mute)] sm:text-base">
              <p>
                We have made cancellation entirely self-serve and transparent. You
                can cancel your free trial or active subscription at any time
                without having to contact customer support.
              </p>
              <p className="font-semibold text-[var(--ib-ink)]">
                To cancel, please use one of the following methods:
              </p>
              <ol className="list-decimal space-y-4 pl-5 marker:font-semibold marker:text-[var(--ib-acc)]">
                <li>
                  <strong className="text-[var(--ib-ink)]">
                    Student Dashboard:
                  </strong>{" "}
                  Log into your Isobrain account, scroll to the bottom section of
                  your Student Dashboard, and click the cancellation option.
                </li>
                <li>
                  <strong className="text-[var(--ib-ink)]">
                    Stripe Subscription Page:
                  </strong>{" "}
                  Manage or cancel your subscription directly through the secure
                  Stripe billing portal link provided to you upon initial signup.
                </li>
              </ol>
              <div
                className="rounded-xl border border-[color-mix(in_srgb,#D97706_30%,var(--ib-line))] bg-[color-mix(in_srgb,#D97706_10%,var(--ib-card))] p-4"
                role="note"
              >
                <p className="text-[14.5px] leading-relaxed text-[var(--ib-ink)]">
                  <strong className="text-[#B45309]">Note:</strong> Deleting your
                  account or uninstalling any associated software does not cancel
                  your subscription. You must use one of the two methods listed
                  above to stop future billing.
                </p>
              </div>
            </div>
          </motion.section>

          {/* 4 */}
          <motion.section
            id="continued-access"
            {...fadeUp(reduceMotion, 0.04)}
            className="ib-card scroll-mt-28 overflow-hidden p-6 sm:p-8"
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--ib-acc)_18%,var(--ib-line))] bg-[var(--ib-accbg)] text-[var(--ib-acc)]">
                <ShieldAlert className="size-5" aria-hidden />
              </span>
              <h2 className="mb-0! text-[22px] font-bold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[24px]">
                4. Continued Access After Cancellation
              </h2>
            </div>
            <p className="text-[15.5px] leading-[1.7] text-[var(--ib-mute)] sm:text-base">
              If you choose to cancel your subscription (or cancel after your free
              trial has converted to a paid plan), you will not be billed for any
              future cycles. However, you will retain full access to all tools,
              features, and limits as per your availed package for the remainder
              of your current paid subscription period. Your access will
              automatically expire at the end of your billing cycle.
            </p>
          </motion.section>

          {/* 5 */}
          <motion.section
            id="chargebacks"
            {...fadeUp(reduceMotion, 0.04)}
            className="ib-card scroll-mt-28 overflow-hidden p-6 sm:p-8"
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,#DC2626_22%,var(--ib-line))] bg-[color-mix(in_srgb,#DC2626_8%,var(--ib-card))] text-[#B91C1C]">
                <AlertTriangle className="size-5" aria-hidden />
              </span>
              <h2 className="mb-0! text-[22px] font-bold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[24px]">
                5. Chargebacks and Bank Disputes
              </h2>
            </div>
            <div className="space-y-4 text-[15.5px] leading-[1.7] text-[var(--ib-mute)] sm:text-base">
              <p>
                This policy is agreed to at the time of checkout. Because we
                provide clear, upfront communication regarding our free trial
                duration, recurring billing cycles, and self-serve cancellation
                methods, any disputes or chargebacks filed with your bank or
                credit card company (such as claims of &quot;fraud,&quot;
                &quot;unrecognized charge,&quot; or &quot;unaware of cancellation
                terms&quot;) will be considered a breach of these Terms.
              </p>
              <p>
                In the event of a chargeback, we will submit this agreed-upon
                policy, alongside our system logs showing your IP address, login
                history, and timestamped agreement to these terms, to Stripe and
                your financial institution to successfully contest and settle the
                dispute.
              </p>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
