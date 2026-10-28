"use client";

import ISOStandardsNexus from "@/components/Library/iso-standards/ISOStandardsNexus";
import { ArrowRight, Library } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import "@/lib/i18n/client";

const ease = [0.22, 1, 0.36, 1] as const;

const Page = () => {
  const reduceMotion = useReducedMotion();
  const { i18n } = useTranslation();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isRTL = i18n.language === "ar";

  return (
    <div
      className="min-h-screen bg-[var(--ib-bg)] font-sans text-[var(--ib-ink)] selection:bg-[var(--ib-acc)] selection:text-white"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <header className="relative overflow-x-clip px-4 pb-8 pt-12 sm:px-6 sm:pb-10 sm:pt-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute left-1/2 top-[-12%] h-[520px] w-[min(920px,100%)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--ib-acc)_14%,transparent),transparent_70%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--ib-line)] to-transparent" />
        </div>

        <div className="ib-w relative z-[1] max-w-7xl!">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="mx-auto max-w-[760px] text-center"
          >
            <div className="ib-eye mx-auto inline-flex items-center gap-2">
              <Library className="size-3.5" aria-hidden />
              Work with the standards. Not around them
            </div>

            <h1 className="mb-0! mt-3 text-[32px] font-bold leading-[1.12] tracking-[-0.035em] text-[var(--ib-ink)] sm:text-[40px] lg:text-[48px]">
              ISO Standards Library
            </h1>

            <p className="mx-auto mt-4 max-w-[640px] text-[15px] font-medium leading-relaxed text-[var(--ib-mute)] sm:text-[16.5px]">
              250+ international standards. Chat with AI, audit clauses, and
              accelerate compliance — all in one workspace.
            </p>
          </motion.div>
        </div>
      </header>

      <section className="border-y border-[var(--ib-line)] bg-[var(--ib-card)] px-4 py-12 sm:px-6 sm:py-14">
        <div className="ib-w mx-auto max-w-3xl! text-center">
          <div className="ib-eye mx-auto">ISO Library overview</div>
          <h2 className="mb-0! mt-2 text-[24px] font-bold tracking-[-0.03em] text-[var(--ib-ink)] sm:text-[30px]">
            What the ISO Library is for
          </h2>
          <p className="mt-4 text-[15px] font-medium leading-relaxed text-[var(--ib-mute)] sm:text-[16.5px]">
            The ISO Library is your working knowledge base for international
            management-system standards. Browse by category, open the exact
            edition you need, and use ISOBrain.AI to explain clauses, compare
            requirements, and prepare for implementation or audit—without
            digging through disconnected PDFs.
          </p>
          <p className="mt-4 text-[15px] font-medium leading-relaxed text-[var(--ib-mute)] sm:text-[16.5px]">
            Each standard can include its own overview for clearer context and
            SEO. When you are ready to go deeper, continue into ISO Academy for
            structured learning paths.
          </p>
        </div>
      </section>

      <ISOStandardsNexus />

      <section className="px-4 pb-20 pt-6 sm:px-6 sm:pb-28 sm:pt-10">
        <div className="ib-w max-w-5xl!">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45, ease }}
            className="relative overflow-hidden rounded-[24px] bg-[var(--ib-acc)] px-6 py-12 text-center sm:rounded-[32px] sm:px-12 sm:py-16 md:px-16 md:py-20"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,255,255,0.18),transparent_55%)]"
            />
            <div className="relative z-[1] flex flex-col items-center">
              <h2 className="mb-0! text-[26px] font-semibold leading-[1.25] text-white sm:text-[34px]">
                Ready for the next level?
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] font-medium leading-relaxed text-white/85 sm:text-[17px]">
                Move from exploring standards in the Library to structured
                learning in ISO Academy—adaptive paths, real-world examples, and
                clear next steps.
              </p>
              <Link
                href={`/${lang}/academy`}
                className="mt-8 inline-flex items-center gap-2.5 rounded-[10px] bg-white px-8 py-4 text-[12px] font-bold uppercase tracking-[1px] text-[var(--ib-ink)] transition-opacity hover:opacity-92 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-10 sm:py-5 sm:text-[14px]"
              >
                Go to ISO Academy
                <ArrowRight className="size-5" aria-hidden />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Page;
