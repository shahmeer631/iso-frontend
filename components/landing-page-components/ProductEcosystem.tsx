"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, type LucideIcon } from "lucide-react";
import HomeProductVisual from "@/components/landing-page-components/HomeProductVisual";

export type EcosystemProduct = {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  reverse: boolean;
  eyebrow?: string;
};

type ProductEcosystemProps = {
  products: EcosystemProduct[];
};

export default function ProductEcosystem({ products }: ProductEcosystemProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="ib-section ib-section-alt overflow-x-clip" id="platform">
      <div className="ib-w">
        <motion.div
          className="mb-12 max-w-[680px] md:mb-16"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="ib-eye">The complete ISO ecosystem</div>
          <h2 className="mb-0!">Four tools, one connected system</h2>
          <p className="mt-3.5 text-[17px] text-[var(--ib-mute)]">
            Start assessing, learn the standards, master the curriculum, then
            apply with AI—directly from the homepage.
          </p>
        </motion.div>

        <div className="relative flex flex-col gap-10 md:gap-14">
          <div
            aria-hidden
            className="pointer-events-none absolute top-8 bottom-8 left-1/2 z-0 hidden w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,var(--ib-line)_12%,var(--ib-line)_88%,transparent)] lg:block"
          />

          {products.map((product, index) => {
            const Icon = product.icon;
            const step = String(index + 1).padStart(2, "0");
            const textFrom = product.reverse ? 24 : -24;
            const visualFrom = product.reverse ? -24 : 24;

            return (
              <motion.article
                key={product.id}
                initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.55,
                  delay: reduceMotion ? 0 : 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="ib-card group relative z-[1] overflow-hidden p-6 sm:p-8 lg:p-12"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-20 -top-24 size-[280px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--ib-acc)_16%,transparent),transparent_70%)] opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                />

                <div
                  className={`relative z-10 flex flex-col items-center gap-8 lg:gap-14 ${
                    product.reverse ? "lg:flex-row-reverse" : "lg:flex-row"
                  }`}
                >
                  <motion.div
                    className="w-full space-y-5 text-center lg:w-1/2 lg:text-left"
                    initial={
                      reduceMotion ? false : { opacity: 0, x: textFrom }
                    }
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{
                      duration: 0.5,
                      delay: reduceMotion ? 0 : 0.12,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                      <span className="inline-flex items-center rounded-full border border-[var(--ib-line)] bg-[var(--ib-bg)] px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] text-[var(--ib-acc)] uppercase">
                        {product.eyebrow || `Step ${step}`}
                      </span>
                      <div className="grid size-12 place-items-center rounded-[12px] border border-[var(--ib-line)] bg-[var(--ib-accbg)] text-[var(--ib-acc)] transition-transform duration-300 group-hover:scale-105">
                        <Icon className="size-6" aria-hidden />
                      </div>
                    </div>

                    <h3 className="mb-0! text-[28px]! tracking-[-0.02em] sm:text-[32px]!">
                      {product.title}
                    </h3>
                    <p className="text-[15px] leading-relaxed text-[var(--ib-mute)] sm:text-base">
                      {product.description}
                    </p>
                    <Link
                      href={product.href}
                      className="inline-flex items-center gap-2 rounded-[10px] text-[14.5px] font-semibold text-[var(--ib-acc)] transition-all hover:gap-2.5 hover:opacity-90"
                    >
                      {product.cta}
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </motion.div>

                  <motion.div
                    className="w-full lg:w-1/2"
                    initial={
                      reduceMotion
                        ? false
                        : { opacity: 0, x: visualFrom, scale: 0.97 }
                    }
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{
                      duration: 0.55,
                      delay: reduceMotion ? 0 : 0.18,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <HomeProductVisual productId={product.id} />
                  </motion.div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
