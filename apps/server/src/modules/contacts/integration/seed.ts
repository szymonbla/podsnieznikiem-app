import { Effect } from "effect"

import { ContactsRepository } from "./repository.js"
import { sampleContacts } from "./seed-data.js"

/**
 * Loads the sample set and returns how many contacts were actually inserted —
 * zero on a repeat run. Kept apart from migrations: migrations describe the
 * schema, not the content (DESIGN.md §10).
 */
export const seedContacts = Effect.flatMap(ContactsRepository, (repository) =>
  repository.insertManyUnlessIdentical(sampleContacts)
)
