import { z } from "zod"

import type { ContactField, CreateContactBody } from "../domain/models"
import { normalizePhone, PHONE_DIGITS } from "../domain/phone"
import { CONTACT_LIMITS } from "./constraints"

/**
 * Zod opisuje **wyłącznie formularz** — pola, komunikaty i moment walidacji.
 * W kontrakcie z API nie uczestniczy; ten trzyma `effect/Schema` po stronie
 * serwera i wygenerowane typy po stronie klienta (ADR-0001).
 *
 * Mieszka w `configuration`, a nie w `domain`, bo sięga po limity długości —
 * a `domain` nie importuje niczego z warstw wyższych (DESIGN.md §3).
 */

/**
 * Pole tekstowe wymagane po przycięciu — same spacje to puste pole, nie treść.
 * Przycięcie jest w schemacie, więc do API idzie już wartość czysta, tak jak
 * zakłada ograniczenie bazy (DESIGN.md §6).
 */
const required = (message: string, max: number, tooLong: string) =>
  z
    .string({ error: message })
    .trim()
    .min(1, { error: message })
    .max(max, { error: tooLong })

export const CONTACT_FIELDS: ReadonlyArray<ContactField> = ["name", "role", "phone"]

/**
 * Czy ścieżka z odpowiedzi walidacyjnej wskazuje na pole formularza. Serwer
 * mówi o kształcie żądania, formularz o polach — to jedyne miejsce, w którym
 * jedno przechodzi w drugie.
 */
export const isContactField = (value: unknown): value is ContactField =>
  typeof value === "string" && CONTACT_FIELDS.includes(value as ContactField)

export const contactFormMessages = {
  name: {
    required: "Podaj imię i nazwisko",
    tooLong: `Imię i nazwisko może mieć najwyżej ${CONTACT_LIMITS.name.max} znaków`
  },
  role: {
    required: "Podaj specjalizację",
    tooLong: `Specjalizacja może mieć najwyżej ${CONTACT_LIMITS.role.max} znaków`
  },
  phone: {
    required: "Podaj numer telefonu",
    wrongLength: `Numer musi mieć ${PHONE_DIGITS} cyfr`
  }
} as const

/**
 * Numer wolno wkleić w dowolnym zapisie — odstępy, myślniki i `+48` znikają
 * przy walidacji, zamiast być powodem odrzucenia (spec 0001, historia 37).
 * Transformacja jest częścią schematu, więc **wyjście** schematu to już
 * dziewięć cyfr — dokładnie to, co przyjmuje API.
 */
/** Wzorzec liczony raz — schemat pola sprawdza go przy każdym naciśnięciu klawisza. */
const PHONE_PATTERN = new RegExp(`^\\d{${PHONE_DIGITS}}$`)

const phoneField = z
  .string({ error: contactFormMessages.phone.required })
  .trim()
  .min(1, { error: contactFormMessages.phone.required })
  .transform(normalizePhone)
  .refine((digits) => PHONE_PATTERN.test(digits), {
    error: contactFormMessages.phone.wrongLength
  })

export const contactFormSchema = z.object({
  name: required(
    contactFormMessages.name.required,
    CONTACT_LIMITS.name.max,
    contactFormMessages.name.tooLong
  ),
  role: required(
    contactFormMessages.role.required,
    CONTACT_LIMITS.role.max,
    contactFormMessages.role.tooLong
  ),
  phone: phoneField
})

/** Stan pól tak, jak stoją w formularzu — numer jeszcze w zapisie właściciela. */
export type ContactFormValues = z.input<typeof contactFormSchema>

/** Wartości po walidacji — numer już znormalizowany, gotowy do wysłania. */
export type ContactFormOutput = z.output<typeof contactFormSchema>

/*
 * Powiązanie formularza z kontraktem trzyma asercja typowa, nie dyscyplina:
 * porównuje **wyjście** zoda (stan po transformacji) z ciałem żądania z OpenAPI.
 * Rozjazd jest błędem kompilacji, a nie 400-tką w runtime (DESIGN.md §5).
 */
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
  ? true
  : false
type Expect<T extends true> = T

type _EnsureContract = Expect<Equal<ContactFormOutput, CreateContactBody>>
