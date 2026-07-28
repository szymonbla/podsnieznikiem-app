import { PHONE_DIGITS } from "../domain/phone"

/**
 * Liczby, które muszą zgadzać się z ograniczeniami bazy i kontraktu
 * (DESIGN.md §6). Stoją osobno od schematu, bo sięgają po nie także teksty
 * komunikatów — inaczej „najwyżej 100 znaków" i `maxLength(100)` rozjeżdżałyby
 * się przy pierwszej zmianie.
 */
export const CONTACT_LIMITS = {
  name: { min: 1, max: 100 },
  role: { min: 1, max: 60 },
  phoneDigits: PHONE_DIGITS
} as const
