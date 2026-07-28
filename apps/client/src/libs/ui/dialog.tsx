import * as DialogPrimitive from "@radix-ui/react-dialog"
import type { ComponentProps } from "react"

/**
 * Prymityw okna modalnego na Radiksie, ostylowany paletą z projektu.
 * Uwięzienie fokusu, powrót fokusu na przycisk otwierający i zamykanie
 * Escape'em przychodzą z biblioteki — nie są przepisywane tutaj i nie są
 * testowane osobno (spec 0001 → Czego nie testujemy).
 */
export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close
export const DialogTitle = ({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) => (
  <DialogPrimitive.Title
    className={`font-heading text-base font-semibold ${className ?? ""}`}
    {...props}
  />
)
export const DialogDescription = ({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) => (
  <DialogPrimitive.Description
    className={`text-muted-foreground ${className ?? ""}`}
    {...props}
  />
)

export const DialogContent = ({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 bg-foreground/40" />
    <DialogPrimitive.Content
      className={`fixed left-1/2 top-1/2 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-card border border-separator bg-background p-6 shadow-lg animate-pop-in ${className ?? ""}`}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
)
