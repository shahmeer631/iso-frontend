"use client";

import Image, { type StaticImageData } from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import brandSamsung from "@/public/Samsung-icon.png";
import brandAbb from "@/public/ABB-icon.png";
import brandCanon from "@/public/Canon-icon.png";
import brandCat from "@/public/CAT-icon.png";
import brandDhl from "@/public/DHL-icon.png";
import brandNestle from "@/public/Nestle-icon.png";
import brandPepsico from "@/public/PepsiCo-icon.png";
import brandSchneider from "@/public/Schneider-icon.png";
import brand3m from "@/public/3M-icon.png";

type Brand = {
  src: StaticImageData;
  alt: string;
};

const BRANDS: Brand[] = [
  { src: brandSamsung, alt: "Samsung" },
  { src: brandAbb, alt: "ABB" },
  { src: brandCanon, alt: "Canon" },
  { src: brandCat, alt: "Caterpillar" },
  { src: brandDhl, alt: "DHL" },
  { src: brandNestle, alt: "Nestlé" },
  { src: brandPepsico, alt: "PepsiCo" },
  { src: brandSchneider, alt: "Schneider Electric" },
  { src: brand3m, alt: "3M" },
];

function LogoRow({
  brands,
  ariaHidden,
}: {
  brands: Brand[];
  ariaHidden?: boolean;
}) {
  return (
    <ul
      className="flex shrink-0 items-center gap-6 sm:gap-8 md:gap-10 px-3 sm:px-4"
      aria-hidden={ariaHidden || undefined}
    >
      {brands.map((brand, index) => (
        <li
          key={`${brand.alt}-${index}-${ariaHidden ? "dup" : "main"}`}
          className="flex shrink-0 items-center justify-center"
        >
          <Image
            src={brand.src}
            alt={ariaHidden ? "" : brand.alt}
            width={112}
            height={112}
            className="h-16 w-16 sm:h-20 sm:w-20 md:h-[104px] md:w-[104px] object-contain"
            sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 104px"
            priority={index < 4 && !ariaHidden}
          />
        </li>
      ))}
    </ul>
  );
}

type BrandNameProps = {
  className?: string;
  showTrustedLabel?: boolean;
};

const BrandName = ({
  className = "",
  showTrustedLabel = false,
}: BrandNameProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <section
      dir="ltr"
      className={`border-y border-[var(--ib-line)] bg-[var(--ib-card)] py-7 overflow-hidden [direction:ltr] ${className}`}
      aria-label="Trusted by leading organizations"
    >
      <div
        className={`ib-w flex items-center gap-6 md:gap-10 ${
          showTrustedLabel ? "flex-col sm:flex-row" : ""
        }`}
      >
        {showTrustedLabel && (
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative shrink-0 max-w-[168px] text-center text-[13.5px] font-semibold leading-[1.35] tracking-[-0.015em] text-[var(--ib-ink)] sm:text-left"
          >
            <span
              className="bg-[linear-gradient(105deg,var(--ib-acc)_0%,var(--ib-ink)_55%,var(--ib-acc)_100%)] bg-clip-text text-transparent"
              style={{
                backgroundSize: "200% 100%",
                animation: reduceMotion
                  ? undefined
                  : "brand-heading-shine 7s ease-in-out infinite alternate",
              }}
            >
              Trusted
            </span>{" "}
            by teams at{" "}
            <span className="bg-[linear-gradient(105deg,var(--ib-ink)_10%,var(--ib-acc)_100%)] bg-clip-text font-bold text-transparent">
              leading organizations
            </span>
            <span
              aria-hidden
              className="mx-auto mt-2 block h-[2px] w-10 rounded-full bg-[linear-gradient(90deg,var(--ib-acc),transparent)] sm:mx-0"
            />
          </motion.p>
        )}

        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee-left motion-reduce:animate-none [--duration:35s] hover:[animation-play-state:paused]">
            <LogoRow brands={BRANDS} />
            <LogoRow brands={BRANDS} ariaHidden />
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-16 bg-gradient-to-r from-[var(--ib-card)] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-16 bg-gradient-to-l from-[var(--ib-card)] to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default BrandName;
