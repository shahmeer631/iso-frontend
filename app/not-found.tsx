"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--ib-bg)] text-center p-6 text-[var(--ib-ink)]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 max-w-md"
      >
        <div className="ib-card w-full p-10">
          <div className="mx-auto mb-6 grid size-14 place-items-center rounded-[10px] bg-[var(--ib-acc)] text-white text-lg font-bold">
            IB
          </div>
          <h1 className="text-[38px]! leading-[1.06]! tracking-[-0.035em]! mb-3">
            Page not found
          </h1>
          <p className="text-[var(--ib-mute)] leading-relaxed mb-8">
            The page you&apos;re looking for doesn&apos;t exist or may have been
            moved.
          </p>
          <Button size="lg" asChild>
            <Link href="/en">Back to Home</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
