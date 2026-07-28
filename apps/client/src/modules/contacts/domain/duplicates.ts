import type { Contact } from "./models"
import { isEmptyPhone, parsePhone } from "./phone"

/**
 * Who already has this number — computed locally, on the fetched list, with no
 * extra API call (spec 0001 -> Klient). The comparison runs on the normalised
 * number, not on what the field shows: `"+48 602-118-447"` and `"602118447"`
 * are the same number.
 *
 * `excludeId` leaves out the contact being edited — otherwise it would warn
 * about itself on every change of the name (ticket 08).
 *
 * A duplicate is a **warning, not an error**: one person working two trades is
 * two contacts sharing a number (CONTEXT.md -> Telefon), so the save goes
 * through.
 */
export const findPhoneOwner = (
  contacts: ReadonlyArray<Contact>,
  phone: string,
  excludeId?: string
): Contact | undefined => {
  const typed = parsePhone(phone)
  if (isEmptyPhone(typed)) return undefined

  return contacts.find(
    (contact) => contact.id !== excludeId && parsePhone(contact.phone) === typed
  )
}
