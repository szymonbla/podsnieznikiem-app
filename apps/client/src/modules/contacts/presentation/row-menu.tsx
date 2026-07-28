import { useRef } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../../../libs/ui/dropdown-menu"
import type { Contact } from "../domain/models"
import { contactsCopy } from "./copy"

interface RowMenuProps {
  readonly contact: Contact
  readonly onCopy: () => void
  /** Wywołania zwrotne dostają przycisk menu, żeby fokus wrócił tu po zamknięciu okna. */
  readonly onEdit: (opener: HTMLElement | null) => void
  readonly onRemove: (opener: HTMLElement | null) => void
}

/**
 * Trzy akcje wiersza w jednym menu — kolumna ma 44 px, więc trzy przyciski obok
 * siebie nie mieszczą się nawet na szerokim ekranie (DESIGN.md §4).
 *
 * Menu jest jedno na wiersz, więc jego nazwa musi nieść nazwisko: „Akcje"
 * powtórzone dwadzieścia cztery razy nie mówi czytnikowi ekranu, którego
 * kontaktu dotyczy.
 */
export const RowMenu = ({ contact, onCopy, onEdit, onRemove }: RowMenuProps) => {
  const trigger = useRef<HTMLButtonElement>(null)

  return (
  <DropdownMenu>
    <DropdownMenuTrigger
      ref={trigger}
      aria-label={contactsCopy.row.menu(contact.name)}
      className="rounded-[var(--radius)] px-2 py-1 text-muted-foreground hover:bg-muted-hover"
    >
      <span aria-hidden="true">⋯</span>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onSelect={onCopy}>{contactsCopy.row.copyItem}</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => onEdit(trigger.current)}>{contactsCopy.row.edit}</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => onRemove(trigger.current)} className="text-destructive">
        {contactsCopy.row.remove}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  )
}
