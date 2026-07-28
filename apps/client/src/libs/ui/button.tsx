import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/libs/ui/utils"

/*
 * The variants mirror the design, not shadcn's defaults. The main difference:
 * the primary button is graphite (`--color-foreground`), not the accent colour
 * — teal serves links, icons and focus in this design, never large surfaces.
 * The focus ring comes globally from `:focus-visible` in `index.css`, so the
 * variants do not repeat it.
 *
 * `cursor-pointer` sits in the base because Tailwind v4 drops the hand cursor
 * from `<button>`. Without it the only clickable things with a cursor would be
 * links, and buttons would look dead.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-bold transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "rounded-card bg-foreground text-background hover:bg-foreground-strong active:translate-y-px",
        destructive: "rounded-action bg-destructive text-destructive-foreground hover:bg-destructive-hover",
        outline: "rounded-action border border-border bg-background hover:bg-muted",
        secondary: "rounded-action bg-muted text-foreground hover:bg-muted-hover",
        ghost: "rounded-[9px] text-muted-foreground hover:bg-muted-hover hover:text-foreground",
        link: "text-primary underline underline-offset-[3px] hover:text-foreground",
      },
      size: {
        default: "px-[18px] py-[11px] text-sm",
        sm: "px-4 py-[10px] text-sm",
        icon: "size-10",
        "icon-sm": "size-[26px] rounded-pill",
        inline: "p-0 text-2xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
