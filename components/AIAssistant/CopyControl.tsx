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
      className="inline-flex items-center gap-1 rounded-lg border border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-[8px] px-2 py-1 text-[11px] font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#3B82F6]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
      aria-label={label}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}
