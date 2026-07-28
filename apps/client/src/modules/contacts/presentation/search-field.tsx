import { Search, X } from "lucide-react"

import { Button } from "../../../libs/ui/button"
import { contactsCopy } from "./copy"

interface SearchFieldProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly onClear: () => void
  /**
   * The id of the results counter. The field describes itself with it, so on
   * entering the filter a screen reader says straight away how many contacts
   * are visible — without it the number changes elsewhere on the screen and
   * nothing ties it to the field.
   */
  readonly countId: string
}

/**
 * The field is controlled by the address rather than by component state — a
 * typed letter is in the URL at once, so a refresh and "back" see the same
 * thing the list does (DESIGN.md §9). Filtering happens locally, on the fetched
 * list, so there is no point deferring it: `GET /contacts` still takes no
 * parameters (DESIGN.md §7).
 *
 * The field has no border of its own — the line under the whole filter bar is
 * its outline. That makes the search read as part of the list header rather
 * than a form above it. For the same reason it does not use `Input` from
 * `libs/ui`: this is the one field in the app that deliberately does not look
 * like one.
 */
export const SearchField = ({ value, onChange, onClear, countId }: SearchFieldProps) => (
  <div className="flex min-w-0 flex-[1_1_200px] items-center gap-2.5">
    <Search
      aria-hidden="true"
      strokeWidth={2.1}
      className="size-[17px] flex-none text-ink-placeholder"
    />
    <input
      type="search"
      aria-label={contactsCopy.search.label}
      aria-describedby={`search-hint ${countId}`}
      placeholder={contactsCopy.search.placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-w-0 flex-auto border-0 bg-transparent py-2 text-base text-foreground outline-none placeholder:text-ink-placeholder [&::-webkit-search-cancel-button]:hidden"
    />
    {/* How filtering works has nowhere to stand in the bar, but it must be said. */}
    <span id="search-hint" className="sr-only">
      {contactsCopy.search.hint}
    </span>
    {value === "" ? null : (
      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        onClick={onClear}
        aria-label={contactsCopy.search.clear}
        className="flex-none hover:bg-muted-active"
      >
        <X aria-hidden="true" className="size-3" strokeWidth={2.4} />
      </Button>
    )}
  </div>
)
