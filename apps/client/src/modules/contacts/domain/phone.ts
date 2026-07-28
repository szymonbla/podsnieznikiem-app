/**
 * A phone number lives in the database as nine bare digits (DESIGN.md §6). The
 * readable format and the dialling prefix appear only here, on the way to the
 * screen — so that there is one representation for comparing and one for
 * showing.
 *
 * It lives in `domain` rather than `integration` because the form schema
 * reaches for it, and `domain` must not import from higher layers.
 */

/** A number reaches the database as exactly this many digits, unprefixed and unformatted. */
export const PHONE_DIGITS = 9

/** The dialling prefix in the three notations people actually paste. */
const DIALING_PREFIX = /^(?:\+48|0048|48)/

/** The one place where "whatever was typed" becomes digits only. */
const digitsOf = (input: string): string => input.replace(/\D/g, "")

/**
 * Keeps the digits only and strips the dialling prefix, so that
 * `"+48 602-118-447"`, `"602 118 447"` and `"602118447"` all reduce to one
 * string.
 *
 * The prefix is stripped only when it really is one: when the input starts
 * with `+` or `00`, or when there are more digits than a number holds. A bare
 * `48` typed into the search box is a fragment of a number, not a prefix — and
 * stays that way.
 */
export const normalizePhone = (input: string): string => {
  const digits = digitsOf(input)
  const explicitPrefix = /^\s*(?:\+|00)/.test(input)
  if (!explicitPrefix && digits.length <= PHONE_DIGITS) return digits

  const withoutPrefix = digits.replace(DIALING_PREFIX, "")

  return withoutPrefix.length > 0 ? withoutPrefix : digits
}

/**
 * `602118447` -> `602 118 447`. A number of unusual length comes back
 * unchanged — better to show it raw than to cut it at places that mean
 * nothing.
 */
export const formatPhone = (phone: string): string => {
  const digits = digitsOf(phone)
  if (digits.length !== PHONE_DIGITS) return phone

  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
}

/** The dial address — with the prefix, because `tel:` knows no country context. */
export const phoneHref = (phone: string): string => `tel:+48${digitsOf(phone)}`
