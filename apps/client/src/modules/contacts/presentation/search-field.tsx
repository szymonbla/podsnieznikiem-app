import { contactsCopy } from "./copy"

interface SearchFieldProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly onClear: () => void
}

/**
 * Pole niekontrolowane przez stan komponentu, tylko przez adres — wpisana
 * litera od razu jest w URL-u, więc odświeżenie i „wstecz" widzą to samo, co
 * lista (DESIGN.md §9). Filtrowanie dzieje się lokalnie, na pobranej liście,
 * więc nie ma po co odwlekać go w czasie: `GET /contacts` nadal nie przyjmuje
 * żadnych parametrów (DESIGN.md §7).
 */
export const SearchField = ({ value, onChange, onClear }: SearchFieldProps) => (
  <div className="relative flex items-center">
    <input
      type="search"
      aria-label={contactsCopy.search.label}
      placeholder={contactsCopy.search.placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-64 rounded-[var(--radius)] border border-input bg-background px-3 py-[10px] pr-10 placeholder:text-ink-placeholder"
    />
    {value === "" ? null : (
      <button
        type="button"
        onClick={onClear}
        aria-label={contactsCopy.search.clear}
        className="absolute right-2 rounded-pill px-2 text-muted-foreground hover:bg-muted-hover"
      >
        <span aria-hidden="true">×</span>
      </button>
    )}
  </div>
)
