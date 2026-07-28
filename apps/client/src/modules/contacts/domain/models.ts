import type { operations } from "../../../generated/api"

/**
 * The contact shape comes from the generated contract, not from a hand
 * transcription — changing a field on the server breaks compilation here. This
 * is the only place in the module that reaches into `generated/`.
 */
export type Contact =
  operations["contacts.list"]["responses"][200]["content"]["application/json"][number]

/** The `POST /contacts` body — all three fields. */
export type CreateContactBody =
  operations["contacts.create"]["requestBody"]["content"]["application/json"]

/** The `PATCH /contacts/:id` body — only what the owner actually changed. */
export type UpdateContactBody =
  operations["contacts.update"]["requestBody"]["content"]["application/json"]

/**
 * A missing contact arrives from the server as a tagged response, not a bare
 * status. We recognise it by the tag, because the tag survives the addition of
 * another domain error (DESIGN.md §8).
 */
export type ContactNotFound =
  operations["contacts.update"]["responses"][404]["content"]["application/json"]

/** The 400 response — a schema validation error, with a path to the field. */
export type ContactValidationFailure =
  operations["contacts.update"]["responses"][400]["content"]["application/json"]

/**
 * Every way a write can fail on the API side. The union comes from the
 * contract, so a new domain error on the server breaks compilation of the
 * handling — which is the point (DESIGN.md §8).
 */
export type ContactWriteFailure = ContactNotFound | ContactValidationFailure

/** The fields the owner fills in — the same in the form and in the request body. */
export type ContactField = keyof CreateContactBody
