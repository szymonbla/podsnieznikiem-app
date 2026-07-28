import type { Contact } from "../domain/models"
import { normalizePhone } from "../domain/phone"

/** A query made of digits, spaces and dashes only — a number, not text. */
const looksLikeNumber = (query: string): boolean => /^[\d\s\-()+.]+$/.test(query)

/**
 * The query runs against all three fields at once, because the owner does not
 * pick what to search by — they type what they remember (spec 0001,
 * stories 9-11).
 *
 * The number is only compared once the query looks like a number at all.
 * Otherwise `"jan1"` would normalise to `"1"` and match half the list — a lone
 * digit lost among letters is not a query about a number.
 */
export const matchesQuery = (contact: Contact, query: string): boolean => {
  const text = query.toLocaleLowerCase("pl")
  if (contact.name.toLocaleLowerCase("pl").includes(text)) return true
  if (contact.role.toLocaleLowerCase("pl").includes(text)) return true

  if (!looksLikeNumber(query)) return false
  const digits = normalizePhone(query)

  return digits.length > 0 && contact.phone.includes(digits)
}
