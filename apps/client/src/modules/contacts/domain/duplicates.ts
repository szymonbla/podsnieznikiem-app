import type { Contact } from "./models"
import { normalizePhone } from "./phone"

/**
 * Kto już ma ten numer — liczone lokalnie, na pobranej liście, bez dodatkowego
 * zapytania do API (spec 0001 → Klient). Porównanie idzie po numerze
 * znormalizowanym, nie po tym, co widać w polu: `"+48 602-118-447"` i
 * `"602118447"` to ten sam numer.
 *
 * `excludeId` wyłącza edytowany kontakt — inaczej ostrzegałby sam o sobie
 * przy każdej zmianie nazwiska (ticket 08).
 *
 * Duplikat jest **ostrzeżeniem, nie błędem**: jedna osoba wykonująca dwa fachy
 * to dwa kontakty dzielące numer (CONTEXT.md → Telefon), więc zapis przechodzi.
 */
export const findPhoneOwner = (
  contacts: ReadonlyArray<Contact>,
  phone: string,
  excludeId?: string
): Contact | undefined => {
  const digits = normalizePhone(phone)
  if (digits.length === 0) return undefined

  return contacts.find(
    (contact) => contact.id !== excludeId && normalizePhone(contact.phone) === digits
  )
}
