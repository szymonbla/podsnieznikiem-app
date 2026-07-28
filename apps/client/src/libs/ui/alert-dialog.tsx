import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import type { ComponentProps } from "react"

/**
 * Okno ostrzegawcze — osobne od zwykłego dialogu, bo ma inną rolę dla czytnika
 * ekranu (`alertdialog`) i domyślny fokus na wycofaniu się, nie na akcji
 * niszczącej. Używane wyłącznie do usuwania (DESIGN.md §9).
 */
export const AlertDialog = AlertDialogPrimitive.Root
export const AlertDialogAction = AlertDialogPrimitive.Action
export const AlertDialogCancel = AlertDialogPrimitive.Cancel

export const AlertDialogTitle = ({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Title>) => (
  <AlertDialogPrimitive.Title
    className={`font-heading text-base font-semibold ${className ?? ""}`}
    {...props}
  />
)

export const AlertDialogDescription = ({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Description>) => (
  <AlertDialogPrimitive.Description
    className={`text-muted-foreground ${className ?? ""}`}
    {...props}
  />
)

export const AlertDialogContent = ({
  className,
  children,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Content>) => (
  <AlertDialogPrimitive.Portal>
    <AlertDialogPrimitive.Overlay className="fixed inset-0 bg-foreground/40" />
    <AlertDialogPrimitive.Content
      className={`fixed left-1/2 top-1/2 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-card border border-separator bg-background p-6 shadow-lg animate-pop-in ${className ?? ""}`}
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Content>
  </AlertDialogPrimitive.Portal>
)
