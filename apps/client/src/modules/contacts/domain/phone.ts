/**
 * A phone number has three readings of one value: the digits (database,
 * equality), the readable form (table, form) and the dial address. They used to
 * be three `string`s, so the caller had to remember which one it held and every
 * comparison normalised both sides again, just in case.
 *
 * Here the number is read **once** — `parsePhone` turns whatever was typed or
 * pasted into a `Phone` — and afterwards one only asks it for a reading.
 * Normalisation happens at the entrance and nowhere further on.
 *
 * It lives in `domain` rather than `integration` because the form schema
 * reaches for it, and `domain` must not import from higher layers
 * (DESIGN.md §3).
 */

declare const phoneBrand: unique symbol

/**
 * A number already read. The brand is not decoration: it is what stops a raw
 * field value from being passed where digits are expected, which is exactly the
 * mistake the three plain strings used to allow.
 */
export type Phone = string & { readonly [phoneBrand]: true }

/** A number reaches the database as exactly this many digits, unprefixed and unformatted. */
export const PHONE_DIGITS = 9

/** The dialling prefix in the three notations people actually paste. */
const DIALING_PREFIX = /^(?:\+48|0048|48)/

/** The one place where "whatever was typed" becomes digits only. */
const digitsIn = (input: string): string => input.replace(/\D/g, "")

/**
 * Reads a number out of what was typed or pasted: keeps the digits only and
 * strips the dialling prefix, so that `"+48 602-118-447"`, `"602 118 447"` and
 * `"602118447"` all reduce to one value.
 *
 * The prefix is stripped only when it really is one: when the input starts with
 * `+` or `00`, or when there are more digits than a number holds. A bare `48`
 * typed into the search box is a fragment of a number, not a prefix — and stays
 * that way.
 *
 * This is the **only** normalisation in the module. Everything downstream takes
 * a `Phone` and reads it.
 */
export const parsePhone = (input: string): Phone => {
  const digits = digitsIn(input)
  const explicitPrefix = /^\s*(?:\+|00)/.test(input)
  if (!explicitPrefix && digits.length <= PHONE_DIGITS) return digits as Phone

  const withoutPrefix = digits.replace(DIALING_PREFIX, "")

  return (withoutPrefix.length > 0 ? withoutPrefix : digits) as Phone
}

/** Reading one: bare digits — what the database stores and what equality compares. */
export const phoneDigits = (phone: Phone): string => phone

/**
 * Reading two: `602118447` -> `602 118 447`. A number of unusual length comes
 * back unchanged — better to show it raw than to cut it at places that mean
 * nothing.
 */
export const phoneReadable = (phone: Phone): string =>
  phone.length === PHONE_DIGITS
    ? `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`
    : phone

/** Reading three: the dial address — with the prefix, because `tel:` knows no country context. */
export const phoneDial = (phone: Phone): string => `tel:+48${phone}`

/** Whether the number is complete — a fragment is a search query, not a contact's number. */
export const isCompletePhone = (phone: Phone): boolean => phone.length === PHONE_DIGITS

/** Nothing was typed, or nothing that carries digits. */
export const isEmptyPhone = (phone: Phone): boolean => phone.length === 0
