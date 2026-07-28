import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useRef } from "react"

import { Button } from "../../../libs/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../../../libs/ui/dropdown-menu"
import type { Contact } from "../domain/models"
import { contactsCopy } from "./copy"

interface RowMenuProps {
  readonly contact: Contact
  readonly onCopy: () => void
  /** The callbacks receive the menu button, so focus returns here once a dialog closes. */
  readonly onEdit: (opener: HTMLElement | null) => void
  readonly onRemove: (opener: HTMLElement | null) => void
}

/**
 * Three row actions in one menu — the column is 44 px, so three buttons side by
 * side do not fit even on a wide screen (DESIGN.md §4).
 *
 * There is one menu per row, so its name has to carry the person's name: the
 * word "actions" repeated twenty-four times does not tell a screen reader which
 * contact it belongs to.
 *
 * Delete stands behind a separator and in the warning colour — of the three it
 * is the only one that closing the menu cannot take back.
 */
export const RowMenu = ({ contact, onCopy, onEdit, onRemove }: RowMenuProps) => {
  const trigger = useRef<HTMLButtonElement>(null)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={trigger}
          type="button"
          variant="ghost"
          size="icon"
          aria-label={contactsCopy.row.menu(contact.name)}
        >
          <MoreHorizontal aria-hidden="true" className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onCopy}>
          <Copy aria-hidden="true" strokeWidth={1.9} />
          {contactsCopy.row.copyItem}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onEdit(trigger.current)}>
          <Pencil aria-hidden="true" strokeWidth={1.9} />
          {contactsCopy.row.edit}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => onRemove(trigger.current)}>
          <Trash2 aria-hidden="true" strokeWidth={1.9} />
          {contactsCopy.row.remove}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
