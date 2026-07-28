import { Effect } from "effect"

import { ContactsRepository } from "./repository.js"
import { sampleContacts } from "./seed-data.js"

/**
 * Wgrywa zestaw przykładowy i zwraca liczbę faktycznie dodanych kontaktów —
 * przy powtórnym uruchomieniu zero. Osobno od migracji: migracje opisują
 * schemat, nie treść (DESIGN.md §10).
 */
export const seedContacts = Effect.flatMap(ContactsRepository, (repository) =>
  repository.insertManyUnlessIdentical(sampleContacts)
)
