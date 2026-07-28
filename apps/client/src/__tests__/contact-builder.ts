import type { Contact } from "../modules/contacts"

/*
 * Kept apart from `harness.tsx`, because seam 3 tests need only a contact, not
 * a whole React tree — reaching for the builder through the harness would pull
 * the router and the HTTP client into a test of a pure function.
 */

let sequence = 0

/**
 * A contact in the contract's full shape — a test overrides only what it is
 * examining. The type comes from the module, so a new field on the server
 * breaks compilation here instead of quietly leaving a stale fixture.
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
