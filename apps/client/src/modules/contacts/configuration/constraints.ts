import { PHONE_DIGITS } from "../domain/phone"

/**
 * The numbers that must agree with the database and contract constraints
 * (DESIGN.md §6). They sit apart from the schema because the message texts
 * reach for them too — otherwise "at most 100 characters" and `maxLength(100)`
 * would drift apart at the first change.
 */
export const CONTACT_LIMITS = {
  name: { min: 1, max: 100 },
  role: { min: 1, max: 60 },
  phoneDigits: PHONE_DIGITS
} as const
