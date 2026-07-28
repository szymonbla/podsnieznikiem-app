import type { Contact } from "../domain/models"
import { normalizePhone } from "../domain/phone"

/** Zapytanie złożone z samych cyfr, odstępów i myślników — czyli numer, nie tekst. */
const looksLikeNumber = (query: string): boolean => /^[\d\s\-()+.]+$/.test(query)

/**
 * Zapytanie idzie po trzech polach naraz, bo właściciel nie wybiera, czym
 * szuka — wpisuje to, co pamięta (spec 0001, historie 9–11).
 *
 * Po numerze porównuje się dopiero wtedy, gdy zapytanie w ogóle wygląda na
 * numer. Inaczej `"jan1"` zostawiałoby po normalizacji `"1"` i pasowało do
 * połowy listy — jedna cyfra zgubiona wśród liter nie jest zapytaniem o numer.
 */
export const matchesQuery = (contact: Contact, query: string): boolean => {
  const text = query.toLocaleLowerCase("pl")
  if (contact.name.toLocaleLowerCase("pl").includes(text)) return true
  if (contact.role.toLocaleLowerCase("pl").includes(text)) return true

  if (!looksLikeNumber(query)) return false
  const digits = normalizePhone(query)

  return digits.length > 0 && contact.phone.includes(digits)
}
