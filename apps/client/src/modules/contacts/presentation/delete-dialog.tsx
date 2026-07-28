import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle
} from "../../../libs/ui/alert-dialog"
import { buttonClass } from "../../../libs/ui/button"
import type { Contact } from "../domain/models"
import { contactsCopy } from "./copy"

interface DeleteDialogProps {
  /** Kontakt do usunięcia; jego brak zamyka okno. */
  readonly contact: Contact | undefined
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
  readonly onCloseAutoFocus: () => void
}

/**
 * Osobne okno ostrzegawcze — z imieniem, nazwiskiem i specjalizacją, bo
 * potwierdzenie „na pewno?" bez nazwy nie chroni przed niczym (spec 0001,
 * historia 52). Usunięcie po potwierdzeniu jest natychmiastowe i trwałe;
 * ratunkiem jest „Cofnij" w powiadomieniu (ADR-0003).
 */
export const DeleteDialog = ({
  contact,
  onOpenChange,
  onConfirm,
  onCloseAutoFocus
}: DeleteDialogProps) => (
  <AlertDialog open={contact !== undefined} onOpenChange={onOpenChange}>
    {contact !== undefined ? (
      <AlertDialogContent
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          onCloseAutoFocus()
        }}
      >
        <AlertDialogTitle>{contactsCopy.remove.title}</AlertDialogTitle>
        <AlertDialogDescription className="pt-1">
          {contactsCopy.remove.description(contact.name, contact.role)}
        </AlertDialogDescription>

        <div className="flex justify-end gap-2 pt-5">
          <AlertDialogCancel className={buttonClass("secondary")}>
            {contactsCopy.remove.cancel}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={buttonClass("destructive")}>
            {contactsCopy.remove.confirm}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    ) : null}
  </AlertDialog>
)
