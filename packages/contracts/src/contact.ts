import { Schema } from "effect"

export const ContactId = Schema.UUID.pipe(Schema.brand("ContactId"))
export type ContactId = typeof ContactId.Type

export const ContactName = Schema.String.pipe(
  Schema.trimmed(),
  Schema.minLength(1),
  Schema.maxLength(100)
)

export const ContactRole = Schema.String.pipe(
  Schema.trimmed(),
  Schema.minLength(1),
  Schema.maxLength(60)
)

export const ContactPhone = Schema.String.pipe(Schema.pattern(/^\d{9}$/))

export const Contact = Schema.Struct({
  id: ContactId,
  name: ContactName,
  role: ContactRole,
  phone: ContactPhone,
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc
})
export type Contact = typeof Contact.Type

/**
 * Creating requires all three fields — a `POST` without a role is a 400
 * (DESIGN.md §7).
 *
 * The constraints are measured **after trimming** (spec 0001 -> API), so the
 * input fields trim rather than reject: `"  Marek  "` is a valid name, not an
 * error. That is why the shape is not derived from `Contact` — there the same
 * rules stand as a condition on the already-trimmed value the database returns.
 */
export const CreateContactBody = Schema.Struct({
  name: Schema.Trim.pipe(Schema.minLength(1), Schema.maxLength(100)),
  role: Schema.Trim.pipe(Schema.minLength(1), Schema.maxLength(60)),
  phone: ContactPhone
})
export type CreateContactBody = typeof CreateContactBody.Type

/**
 * The edit is partial — an omitted field stays unchanged. Fields cannot be
 * empty, so a role once set cannot be cleared, only overwritten. A deliberate
 * MVP simplification (spec 0001 -> API).
 */
export const UpdateContactBody = Schema.partial(CreateContactBody)
export type UpdateContactBody = typeof UpdateContactBody.Type
