/**
 * Trzy warianty przycisku z projektu (DESIGN.md §4). Zwykła funkcja zwracająca
 * klasy, nie komponent — przyciski w tej aplikacji bywają też wyzwalaczami
 * Radiksa (`asChild`), a te potrzebują klas, nie kolejnej warstwy opakowania.
 */
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] px-[18px] py-[10px] text-sm font-medium disabled:opacity-50"

const VARIANTS = {
  primary: "bg-primary text-primary-foreground hover:bg-foreground-strong",
  secondary: "border border-border bg-background hover:bg-muted-hover",
  destructive: "bg-destructive text-destructive-foreground hover:brightness-95"
} as const

export type ButtonVariant = keyof typeof VARIANTS

export const buttonClass = (variant: ButtonVariant = "primary"): string =>
  `${BASE} ${VARIANTS[variant]}`
