import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useEffect, useId, type ReactNode } from "react"
import { useForm, type UseFormRegisterReturn } from "react-hook-form"

import { Button } from "../../../libs/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../../../libs/ui/dialog"
import { Input } from "../../../libs/ui/input"
import { Label } from "../../../libs/ui/label"
import {
  contactFormSchema,
  isContactField,
  type ContactFormOutput,
  type ContactFormValues
} from "../configuration/schema"
import { findPhoneOwner } from "../domain/duplicates"
import type { Contact } from "../domain/models"
import { formatPhone } from "../domain/phone"
import { contactsCopy } from "./copy"

interface ContactFormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  /** A given contact switches the dialog into edit mode; its absence means adding. */
  readonly contact?: Contact
  /** The whole list — the duplicate warning is computed locally, with no API call. */
  readonly contacts: ReadonlyArray<Contact>
  /**
   * The returned field errors are the server's validation response (400) —
   * they land on a specific field, just like local errors, instead of ending up
   * in a toast (DESIGN.md §8).
   */
  readonly onSubmit: (
    values: ContactFormOutput
  ) => Promise<Readonly<Record<string, string>> | undefined>
  readonly pending: boolean
  readonly onCloseAutoFocus: () => void
}

const EMPTY: ContactFormValues = { name: "", role: "", phone: "" }

interface FieldProps {
  readonly label: string
  readonly placeholder: string
  readonly registration: UseFormRegisterReturn
  readonly error: string | undefined
  /** Content under the field that is not an error — today, the duplicate warning. */
  readonly note?: ReactNode
  readonly inputMode?: "tel"
  /** The suggestions list (`datalist`) — today only on the role field. */
  readonly listId?: string
}

/**
 * A form field together with its label and message — the three fields differ
 * only in text, so written out separately they would differ mainly in where a
 * typo could hide.
 */
const Field = ({
  label,
  placeholder,
  registration,
  error,
  note,
  inputMode,
  listId
}: FieldProps) => {
  /*
   * The message under the field has to be tied to it by id, not by proximity:
   * `role="alert"` reads the error once, as it appears, but on a later return
   * to the field a screen reader repeats only what the field points at through
   * `aria-describedby`.
   */
  const id = useId()
  const errorId = `${id}-error`
  const noteId = `${id}-note`
  const hasNote = note !== undefined && note !== null && note !== false
  const described = [error === undefined ? null : errorId, hasNote ? noteId : null]
    .filter((value) => value !== null)
    .join(" ")

  return (
    <Label className="flex flex-col items-start gap-1.5">
      <span>{label}</span>
      <Input
        {...registration}
        {...(inputMode === undefined ? {} : { inputMode })}
        {...(listId === undefined ? {} : { list: listId })}
        {...(described === "" ? {} : { "aria-describedby": described })}
        placeholder={placeholder}
        aria-invalid={error !== undefined}
        className={inputMode === "tel" ? "tabular-nums" : undefined}
      />
      {error !== undefined ? (
        <span id={errorId} role="alert" className="text-2xs font-medium text-destructive">
          {error}
        </span>
      ) : null}
      {hasNote ? (
        <div id={noteId} className="w-full">
          {note}
        </div>
      ) : null}
    </Label>
  )
}

/**
 * One dialog serves both adding and editing — they differ in the title, the
 * hint and the button label (DESIGN.md §9). Two separate components would have
 * to share validation, phone normalisation and the duplicate warning, so they
 * would share everything but three strings.
 *
 * `Enter` saves (a plain `<form>`), `Escape` closes, and the focus trap and
 * restore come from the dialog primitive.
 */
export const ContactFormDialog = ({
  open,
  onOpenChange,
  contact,
  contacts,
  onSubmit,
  pending,
  onCloseAutoFocus
}: ContactFormDialogProps) => {
  const mode = contact === undefined ? "create" : "edit"
  const copy = contactsCopy.form[mode]

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors }
  } = useForm<ContactFormValues, unknown, ContactFormOutput>({
    resolver: standardSchemaResolver(contactFormSchema),
    // The form does not shout while typing: an error appears only after the
    // field is left, and again on save (spec 0001, story 39).
    mode: "onBlur",
    defaultValues: EMPTY
  })

  /*
   * The dialog stays in the tree while closed, so the fields have to be reset
   * on every open — otherwise editing would show the previous contact's data,
   * and adding would show leftovers from an edit.
   */
  useEffect(() => {
    if (!open) return
    reset(
      contact === undefined
        ? EMPTY
        : { name: contact.name, role: contact.role, phone: formatPhone(contact.phone) }
    )
  }, [open, contact, reset])

  /* The duplicate is found by the normalised number, not by what the field shows. */
  const duplicate = findPhoneOwner(contacts, watch("phone"), contact?.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby="contact-form-description"
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          onCloseAutoFocus()
        }}
      >
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription id="contact-form-description">{copy.description}</DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={(event) => {
            void handleSubmit(async (values) => {
              const serverErrors = await onSubmit(values)
              for (const [field, message] of Object.entries(serverErrors ?? {})) {
                if (isContactField(field)) setError(field, { message })
              }
            })(event)
          }}
          className="flex flex-col gap-3"
        >
          <Field
            label={contactsCopy.form.fields.name}
            placeholder={contactsCopy.form.placeholders.name}
            registration={register("name")}
            error={errors.name?.message}
          />

          <Field
            label={contactsCopy.form.fields.role}
            placeholder={contactsCopy.form.placeholders.role}
            registration={register("role")}
            error={errors.role?.message}
            listId="contact-role-suggestions"
          />

          <datalist id="contact-role-suggestions">
            {contactsCopy.form.roleSuggestions.map((role) => (
              <option key={role} value={role} />
            ))}
          </datalist>

          <Field
            label={contactsCopy.form.fields.phone}
            placeholder={contactsCopy.form.placeholders.phone}
            registration={register("phone")}
            error={errors.phone?.message}
            inputMode="tel"
            note={
              /*
                `status`, not `alert` — this is information to weigh, not a
                reason to stop. The save goes through regardless (ticket 08).
              */
              duplicate === undefined ? null : (
                <span
                  role="status"
                  className="w-full rounded-[var(--radius)] bg-destructive-subtle px-3 py-2 text-2xs font-medium text-foreground"
                >
                  {contactsCopy.form.duplicate(duplicate.name, duplicate.role)}
                </span>
              )
            }
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {contactsCopy.form.cancel}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {copy.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
