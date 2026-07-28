import { z } from "zod"

import type { ContactField, CreateContactBody } from "../domain/models"
import { normalizePhone, PHONE_DIGITS } from "../domain/phone"
import { CONTACT_LIMITS } from "./constraints"

/**
 * Zod describes **only the form** — its fields, messages and the moment of
 * validation. It takes no part in the API contract; that is held by
 * `effect/Schema` on the server and the generated types on the client
 * (ADR-0001).
 *
 * It lives in `configuration` rather than `domain` because it reaches for the
 * length limits — and `domain` imports nothing from higher layers
 * (DESIGN.md §3).
 */

/**
 * A text field required after trimming — whitespace alone is an empty field,
 * not content. The trim lives in the schema, so the API already receives a
 * clean value, exactly as the database constraint assumes (DESIGN.md §6).
 */
const required = (message: string, max: number, tooLong: string) =>
  z
    .string({ error: message })
    .trim()
    .min(1, { error: message })
    .max(max, { error: tooLong })

export const CONTACT_FIELDS: ReadonlyArray<ContactField> = ["name", "role", "phone"]

/**
 * Whether a path from a validation response points at a form field. The server
 * talks about the request shape, the form about fields — this is the only
 * place where one turns into the other.
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
 * The number may be pasted in any notation — spaces, dashes and `+48` are
 * dropped during validation instead of being grounds for rejection (spec 0001,
 * story 37). The transform is part of the schema, so the schema's **output**
 * is already nine digits — exactly what the API accepts.
 */
/** Compiled once — the field schema checks it on every keystroke. */
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

/** The fields as they stand in the form — the number still as the owner typed it. */
export type ContactFormValues = z.input<typeof contactFormSchema>

/** Values after validation — the number normalised and ready to send. */
export type ContactFormOutput = z.output<typeof contactFormSchema>

/*
 * A type assertion, not discipline, keeps the form tied to the contract: it
 * compares zod's **output** (the post-transform state) against the request
 * body from OpenAPI. Drift is a compile error, not a runtime 400
 * (DESIGN.md §5).
 */
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
  ? true
  : false
type Expect<T extends true> = T

type _EnsureContract = Expect<Equal<ContactFormOutput, CreateContactBody>>
