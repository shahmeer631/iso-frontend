"use client";

import Image from "next/image";
import { Quote, Star } from "lucide-react";

export type Testimonial = {
  name: string;
  role: string;
  comment: string;
  avatar: string;
};

/** Existing homepage + ReviewSection testimonials with original avatar assets */
export const HOMEPAGE_TESTIMONIALS: Testimonial[] = [
  {
    name: "Devid Miller",
    role: "Senior Lead Auditor",
    comment:
      "ISOBrain has transformed how we approach ISO 27001. The AI Assistant identifies gaps in seconds that used to take our team days of manual review.",
    avatar: "/user1.png",
  },
  {
    name: "Sarah Jones",
    role: "Compliance Director",
    comment:
      "The most sophisticated ISO tool I've used in 15 years. The Academy ensures my team actually understands compliance rather than just checking boxes.",
    avatar: "/user2.png",
  },
  {
    name: "Michael Chen",
    role: "QHSE Manager",
    comment:
      "A game-changer for integrated management systems. The competency benchmarking helped us identify critical risks before our last major audit.",
    avatar: "/user3.png",
  },
  {
    name: "Emma Wilson",
    role: "ISO Consultant",
    comment:
      "The accuracy of the AI is remarkable. It understands the nuances of various standards perfectly, making it an indispensable partner for my consultancy.",
    avatar: "/user4.png",
  },
];

function TestimonialCard({ review }: { review: Testimonial }) {
  return (
    <article className="relative mx-2.5 flex w-[280px] shrink-0 flex-col justify-between gap-5 rounded-2xl border border-[var(--ib-line)] bg-[var(--ib-card)] p-5 shadow-[0_1px_2px_rgba(11,18,32,0.04)] sm:mx-3 sm:w-[380px] sm:gap-6 sm:rounded-[20px] sm:p-6">
      <Quote
        aria-hidden
        className="pointer-events-none absolute top-4 right-4 size-8 text-[var(--ib-acc)]/15 sm:size-10"
      />

      <div className="relative z-[1] flex gap-0.5" aria-label="5 star rating">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="size-3.5 text-[var(--ib-acc)] sm:size-4"
            fill="var(--ib-acc)"
          />
        ))}
      </div>

      <p className="relative z-[1] text-[13.5px] leading-relaxed text-[var(--ib-mute)] italic sm:text-[15px]">
        “{review.comment}”
      </p>

      <div className="relative z-[1] flex items-center gap-3">
        <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-[var(--ib-line)] bg-[var(--ib-accbg)] sm:size-11">
          <Image
            src={review.avatar}
            alt={review.name}
            fill
            sizes="44px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--ib-ink)] sm:text-[15px]">
            {review.name}
          </p>
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--ib-acc)] sm:text-[11px]">
            {review.role}
          </p>
        </div>
      </div>
    </article>
  );
}

function CardTrack({
  items,
  prefix,
  ariaHidden,
}: {
  items: Testimonial[];
  prefix: string;
  ariaHidden?: boolean;
}) {
  // Two full cycles per track half → seamless at -50% translate
  const loop = [...items, ...items];
  return (
    <div className="flex" aria-hidden={ariaHidden || undefined}>
      {loop.map((review, idx) => (
        <TestimonialCard key={`${prefix}-${idx}`} review={review} />
      ))}
    </div>
  );
}

function MarqueeRow({
  items,
  direction,
  duration = "45s",
}: {
  items: Testimonial[];
  direction: "left" | "right";
  duration?: string;
}) {
  const anim =
    direction === "left" ? "animate-marquee-left" : "animate-marquee-right";

  return (
    <div className="relative overflow-hidden py-2.5">
      <div
        className={`flex w-max ${anim} motion-reduce:animate-none hover:[animation-play-state:paused]`}
        style={{ ["--duration" as string]: duration }}
      >
        <CardTrack items={items} prefix={`${direction}-a`} />
        <CardTrack items={items} prefix={`${direction}-b`} ariaHidden />
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[var(--ib-bg)] to-transparent sm:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[var(--ib-bg)] to-transparent sm:w-16" />
    </div>
  );
}

/**
 * Continuously moving testimonial strips for the homepage
 * “Trusted by professionals” section (restored marquee experience).
 */
export default function TestimonialsMarquee({
  testimonials = HOMEPAGE_TESTIMONIALS,
}: {
  testimonials?: Testimonial[];
}) {
  return (
    <div className="-mx-4 overflow-hidden sm:-mx-6 lg:mx-0" dir="ltr">
      <MarqueeRow items={testimonials} direction="left" duration="48s" />
    </div>
  );
}
