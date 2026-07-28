import type { Contact } from "../modules/contacts"

/*
 * Osobno od `harness.tsx`, bo testy szwu 3 potrzebują tylko kontaktu, a nie
 * całego drzewa Reacta — sięganie po budowniczego przez powłokę wciągałoby
 * router i klienta HTTP do testu funkcji czystej.
 */

let sequence = 0

/**
 * Kontakt o kompletnym kształcie kontraktu — test nadpisuje tylko to, co bada.
 * Typ pochodzi z modułu, więc nowe pole na serwerze psuje kompilację tutaj,
 * zamiast po cichu zostawić nieaktualną atrapę.
 */
export const aContact = (overrides: Partial<Contact> = {}): Contact => {
  sequence += 1
  return {
    id: `00000000-0000-4000-8000-${String(sequence).padStart(12, "0")}`,
    name: "Grzegorz Sobczak",
    role: "Złota rączka",
    phone: "602118447",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
    ...overrides
  }
}
