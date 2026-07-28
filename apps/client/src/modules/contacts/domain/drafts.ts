import type { Contact, CreateContactBody } from "./models"

/**
 * A contact visible on the list before the server answers has no identity from
 * the database yet. The prefix marks exactly that — a local id, replaced the
 * moment the list is invalidated (ADR-0003: even "undo" creates an entry with a
 * new identity).
 */
export const DRAFT_ID_PREFIX = "draft:"

/**
 * Does this contact still lack an identity from the database? The question is
 * domain-level: a draft has no id to send in any request, so nothing can be
 * edited or deleted under it.
 */
export const isDraft = (contact: Contact): boolean => contact.id.startsWith(DRAFT_ID_PREFIX)

/** Builds the locally visible contact from what the owner filled in. */
export const draftContact = (body: CreateContactBody): Contact => {
  const now = new Date().toISOString()

  return { id: `${DRAFT_ID_PREFIX}${crypto.randomUUID()}`, ...body, createdAt: now, updatedAt: now }
}
