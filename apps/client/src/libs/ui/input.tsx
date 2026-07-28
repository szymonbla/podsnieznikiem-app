import * as React from "react"

import { cn } from "@/libs/ui/utils"

/**
 * The design's form field: a `--color-border` outline, 10 px radius, and on
 * focus an accent-coloured border with a soft glow instead of the system
 * outline. This is the only place where `outline` gives way — the glow takes
 * over its job and is just as visible.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-[var(--radius)] border border-border bg-background px-3 py-[10px] text-sm text-foreground transition-[border-color,box-shadow] outline-none",
        "placeholder:text-ink-placeholder",
        "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-subtle",
        "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/15",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
