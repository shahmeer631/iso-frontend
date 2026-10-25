"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ElementType } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  cta: string;
  href: string;
  icon: ElementType;
  iconBgColor?: string;
  iconColor?: string;
}

export default function FeatureCard({
  title,
  description,
  cta,
  href,
  icon: Icon,
  iconBgColor = "var(--ib-accbg)",
  iconColor = "var(--ib-acc)",
}: FeatureCardProps) {
  return (
    <article className="ib-card group flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--ib-acc)_35%,var(--ib-line))] hover:shadow-[0_18px_40px_-24px_rgba(27,77,219,0.35)] sm:p-7">
      <div
        className="mb-5 flex size-12 items-center justify-center rounded-xl"
        style={{ background: iconBgColor }}
      >
        <Icon size={24} color={iconColor} aria-hidden />
      </div>

      <h3 className="mb-0! text-[18px] font-semibold tracking-[-0.02em] text-[var(--ib-ink)] sm:text-[20px]">
        {title}
      </h3>

      <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-[var(--ib-mute)]">
        {description}
      </p>

      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--ib-acc)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ib-acc)]"
      >
        {cta}
        <ArrowRight
          size={16}
          className="transition-transform group-hover:translate-x-1"
          aria-hidden
        />
      </Link>
    </article>
  );
}
