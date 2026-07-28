import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import type { ComponentProps } from "react"

/**
 * Menu akcji przy wierszu. Radix daje `aria-haspopup`, zamykanie Escape'em
 * i kliknięciem obok oraz powrót fokusu na przycisk otwierający — czyli
 * dokładnie to, czego wymaga ticket 09.
 */
export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

export const DropdownMenuContent = ({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      align="end"
      sideOffset={4}
      className={`min-w-44 rounded-[var(--radius)] border border-separator bg-popover p-1 shadow-lg animate-pop-in ${className ?? ""}`}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
)

export const DropdownMenuItem = ({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item>) => (
  <DropdownMenuPrimitive.Item
    className={`flex w-full cursor-default items-center rounded-[var(--radius)] px-3 py-2 text-sm outline-none data-[highlighted]:bg-accent ${className ?? ""}`}
    {...props}
  />
)
