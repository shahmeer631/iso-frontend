import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-[10px] border border-[var(--ib-line)] bg-[var(--ib-card)] px-3.5 py-2 text-[14.5px] text-[var(--ib-ink)] shadow-none transition-[color,box-shadow,border-color] outline-none",
        "placeholder:text-[var(--ib-mute)]",
        "selection:bg-[var(--ib-accbg)] selection:text-[var(--ib-acc)]",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--ib-ink)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-[var(--ib-acc)] focus-visible:ring-2 focus-visible:ring-[var(--ib-acc)]/25",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
