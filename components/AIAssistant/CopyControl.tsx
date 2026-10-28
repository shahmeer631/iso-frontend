"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

/**
 * Shared section-level copy control used by ISO Navigator and Audit Lens.
 * Behavior/styling must stay identical across both surfaces.
 */
export function CopyControl({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  if (!text?.trim()) return null;
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
      className="inline-flex items-center gap-1 rounded-lg border border-[var(--ib-line)] bg-[var(--ib-card)] px-2 py-1 text-[11px] font-medium text-[var(--ib-mute)] transition-colors hover:border-[color-mix(in_srgb,var(--ib-acc)_40%,var(--ib-line))] hover:text-[var(--ib-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ib-acc)]/30"
      aria-label={label}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}
