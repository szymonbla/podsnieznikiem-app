import * as React from "react"
import { cn } from "@/libs/ui/utils"

export const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      data-slot="select"
      className={cn(
        "w-full min-w-0 rounded-[var(--radius)] border border-border bg-background px-3 py-[10px] text-sm text-foreground outline-none",
        "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary-subtle",
        "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/15",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
)
Select.displayName = "Select"
