import type { ReactNode } from "react"

interface EmptyStateProps {
  readonly title: string
  readonly description: string
  readonly action?: ReactNode
  /**
   * Błąd wczytywania to komunikat o zdarzeniu, nie opis zastanego stanu —
   * czytnik ekranu ma go usłyszeć w momencie, w którym się pojawia.
   */
  readonly assertive?: boolean
}

/**
 * Jedna rama dla wszystkich trzech pustych ekranów — brak kontaktów, brak
 * wyników filtra i błąd połączenia. Nie różnią się układem, tylko treścią
 * i tym, dokąd prowadzą; wspólny kształt trzyma je rozróżnialnymi przez to,
 * co naprawdę je różni.
 */
export const EmptyState = ({ title, description, action, assertive }: EmptyStateProps) => (
  <div
    role={assertive === true ? "alert" : "status"}
    className="flex flex-col items-center gap-2 rounded-card border border-separator bg-surface px-6 py-12 text-center animate-fade-up"
  >
    <p className="font-heading text-base font-semibold">{title}</p>
    <p className="max-w-sm text-muted-foreground">{description}</p>
    {action !== undefined ? <div className="pt-2">{action}</div> : null}
  </div>
)
