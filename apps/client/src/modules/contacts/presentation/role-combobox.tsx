import { useId, useRef, useState } from "react"

import { useEscapeLayer } from "../../../libs/ui/escape-layers"
import { Input } from "../../../libs/ui/input"
import { Label } from "../../../libs/ui/label"

interface RoleComboboxProps {
  readonly label: string
  readonly placeholder: string
  readonly suggestions: ReadonlyArray<string>
  readonly value: string
  readonly onChange: (value: string) => void
  readonly onBlur: () => void
  readonly error: string | undefined
}

/**
 * The specialisation field: a free-text input with a list of suggestions.
 *
 * It replaces a native `<input list>` + `<datalist>`. The native popup is
 * browser chrome positioned by the engine, and inside the animated dialog panel
 * Chromium anchored it away from the field — nothing in our CSS reaches it. A
 * list rendered in our own DOM sits where the field is by construction, and it
 * is the only version a test can click.
 *
 * The field stays free text: the suggestions are a shortcut, not a closed set,
 * so a specialisation nobody listed can still be typed in.
 */
export const RoleCombobox = ({
  label,
  placeholder,
  suggestions,
  value,
  onChange,
  onBlur,
  error
}: RoleComboboxProps) => {
  const id = useId()
  const inputId = `${id}-input`
  const listId = `${id}-list`
  const errorId = `${id}-error`

  const [open, setOpen] = useState(false)
  /* Which option the keyboard is on; -1 means "none, the typed text stands". */
  const [active, setActive] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  /*
   * Typing narrows the list, but only once it can narrow anything — a field
   * holding an exact suggestion (just picked, or an edited contact) would
   * otherwise open onto a single option and hide the rest.
   */
  const query = value.trim().toLowerCase()
  const matches =
    query === "" || suggestions.some((s) => s.toLowerCase() === query)
      ? suggestions
      : suggestions.filter((s) => s.toLowerCase().includes(query))

  const close = () => {
    setOpen(false)
    setActive(-1)
  }

  /*
   * While the list is up it is the innermost thing `Escape` can close, so it
   * says so. The dialog around us asks the innermost layer first — which is why
   * the first `Escape` shuts this list and only the second the dialog.
   */
  useEscapeLayer(open, close)

  const pick = (role: string) => {
    onChange(role)
    close()
    inputRef.current?.focus()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      if (!open) {
        setOpen(true)
        setActive(0)
        return
      }
      if (matches.length === 0) return
      const step = event.key === "ArrowDown" ? 1 : -1
      setActive((current) => (current + step + matches.length) % matches.length)
      return
    }

    if (event.key === "Enter" && open && active >= 0) {
      /* The pick is what Enter meant here — it must not also submit the form. */
      event.preventDefault()
      const match = matches[active]
      if (match !== undefined) pick(match)
    }
  }

  return (
    <div className="flex w-full flex-col items-start gap-1.5">
      {/*
       * The label sits beside the field rather than wrapping it. A `<label>`
       * forwards a click anywhere inside itself to its control, so with the
       * list wrapped too, picking an option re-clicked the input and reopened
       * the list the pick had just closed.
       */}
      <Label htmlFor={inputId}>{label}</Label>

      {/* Anchors the list: it is positioned against the field, not the panel. */}
      <div
        className="relative w-full"
        onBlur={(event) => {
          if (event.currentTarget.contains(event.relatedTarget)) return
          close()
          onBlur()
        }}
      >
        <Input
          id={inputId}
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active < 0 ? undefined : `${listId}-${String(active)}`}
          aria-invalid={error !== undefined}
          {...(error === undefined ? {} : { "aria-describedby": errorId })}
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            setOpen(true)
            setActive(-1)
          }}
          /* A click on the field shows what there is to choose from. Not on
             focus: `pick` returns focus here, which would reopen the list the
             pick just closed. */
          onClick={() => {
            setOpen(true)
          }}
          onKeyDown={onKeyDown}
        />

        <button
          type="button"
          /* The list is reachable from the input by keyboard, so this is a
             pointer affordance only — a second tab stop would be in the way. */
          tabIndex={-1}
          aria-hidden
          onClick={() => {
            setOpen((current) => !current)
            inputRef.current?.focus()
          }}
          className="absolute inset-y-0 right-0 flex w-10 cursor-pointer items-center justify-center text-ink-soft"
        >
          <svg viewBox="0 0 10 6" className="w-2.5 fill-current" focusable="false">
            <path d="M0 0h10L5 6z" />
          </svg>
        </button>

        {open && matches.length > 0 ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute top-full right-0 left-0 z-10 mt-1.5 max-h-56 overflow-y-auto rounded-card border border-border-soft bg-popover p-1.5 text-popover-foreground shadow-menu"
          >
            {matches.map((role, index) => (
              <li
                key={role}
                id={`${listId}-${String(index)}`}
                role="option"
                aria-selected={role === value}
                /* Keeps focus on the input, so the wrapper's blur — and the
                   close it triggers — never beats the click to the pick. */
                onMouseDown={(event) => {
                  event.preventDefault()
                }}
                onClick={() => {
                  pick(role)
                }}
                onMouseEnter={() => {
                  setActive(index)
                }}
                className={`cursor-pointer rounded-[0.5rem] px-2.5 py-[9px] text-sm font-semibold ${
                  index === active ? "bg-muted" : ""
                }`}
              >
                {role}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {error !== undefined ? (
        <span id={errorId} role="alert" className="text-2xs font-medium text-destructive">
          {error}
        </span>
      ) : null}
    </div>
  )
}
