import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useEffect, type ReactNode } from "react"
import { useForm, type UseFormRegisterReturn } from "react-hook-form"

import { buttonClass } from "../../../libs/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle
} from "../../../libs/ui/dialog"
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
  /** Podany kontakt przełącza okno w tryb edycji; jego brak to dodawanie. */
  readonly contact?: Contact
  /** Cała lista — ostrzeżenie o duplikacie liczone lokalnie, bez zapytania do API. */
  readonly contacts: ReadonlyArray<Contact>
  /**
   * Zwrócone błędy pól to odpowiedź walidacyjna serwera (400) — trafiają na
   * konkretne pole, tak samo jak błędy lokalne, zamiast lądować w toaście
   * (DESIGN.md §8).
   */
  readonly onSubmit: (
    values: ContactFormOutput
  ) => Promise<Readonly<Record<string, string>> | undefined>
  readonly pending: boolean
  readonly onCloseAutoFocus: () => void
}

const EMPTY: ContactFormValues = { name: "", role: "", phone: "" }

const fieldClass =
  "w-full rounded-[var(--radius)] border border-input bg-background px-3 py-[10px] text-sm placeholder:text-ink-placeholder"

interface FieldProps {
  readonly label: string
  readonly placeholder: string
  readonly registration: UseFormRegisterReturn
  readonly error: string | undefined
  /** Treść pod polem, która nie jest błędem — dziś ostrzeżenie o duplikacie. */
  readonly note?: ReactNode
  readonly inputMode?: "tel"
}

/**
 * Pole formularza wraz z etykietą i komunikatem — trzy pola różnią się tylko
 * treścią, więc rozpisane osobno różniłyby się głównie miejscem na literówkę.
 */
const Field = ({ label, placeholder, registration, error, note, inputMode }: FieldProps) => (
  <label className="flex flex-col gap-1.5">
    <span className="font-medium">{label}</span>
    <input
      {...registration}
      {...(inputMode === undefined ? {} : { inputMode })}
      placeholder={placeholder}
      aria-invalid={error !== undefined}
      className={fieldClass}
    />
    {error !== undefined ? (
      <span role="alert" className="text-xs text-destructive">
        {error}
      </span>
    ) : null}
    {note}
  </label>
)

/**
 * Jedno okno obsługuje dodawanie i edycję — różni je tytuł, podpowiedź
 * i etykieta przycisku (DESIGN.md §9). Dwa osobne komponenty musiałyby dzielić
 * walidację, normalizację numeru i ostrzeżenie o duplikacie, więc dzieliłyby
 * wszystko poza trzema napisami.
 *
 * `Enter` zapisuje (zwykły `<form>`), `Escape` zamyka, a uwięzienie i powrót
 * fokusu przynosi prymityw okna.
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
    // Formularz nie krzyczy w trakcie pisania: błąd pokazuje się dopiero po
    // opuszczeniu pola i ponownie przy zapisie (spec 0001, historia 39).
    mode: "onBlur",
    defaultValues: EMPTY
  })

  /*
   * Okno żyje w drzewie także zamknięte, więc pola trzeba przestawić przy
   * każdym otwarciu — inaczej edycja pokazywałaby dane poprzedniego kontaktu,
   * a dodawanie resztki po edycji.
   */
  useEffect(() => {
    if (!open) return
    reset(
      contact === undefined
        ? EMPTY
        : { name: contact.name, role: contact.role, phone: formatPhone(contact.phone) }
    )
  }, [open, contact, reset])

  /* Duplikat liczony po numerze znormalizowanym, nie po tym, co widać w polu. */
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
        <DialogTitle>{copy.title}</DialogTitle>
        <DialogDescription id="contact-form-description" className="pt-1">
          {copy.description}
        </DialogDescription>

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
          className="flex flex-col gap-4 pt-5"
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
          />

          <Field
            label={contactsCopy.form.fields.phone}
            placeholder={contactsCopy.form.placeholders.phone}
            registration={register("phone")}
            error={errors.phone?.message}
            inputMode="tel"
            note={
              /*
                `status`, nie `alert` — to informacja do rozważenia, nie powód,
                żeby przerwać. Zapis przechodzi mimo niej (ticket 08).
              */
              duplicate === undefined ? null : (
                <span
                  role="status"
                  className="rounded-[var(--radius)] bg-destructive-subtle px-3 py-2 text-xs"
                >
                  {contactsCopy.form.duplicate(duplicate.name, duplicate.role)}
                </span>
              )
            }
          />

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose className={buttonClass("secondary")} type="button">
              {contactsCopy.form.cancel}
            </DialogClose>
            <button type="submit" disabled={pending} className={buttonClass()}>
              {copy.submit}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
