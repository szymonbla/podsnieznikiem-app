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
