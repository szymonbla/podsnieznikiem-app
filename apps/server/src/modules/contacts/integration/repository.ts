import { SqlClient, SqlSchema } from "@effect/sql"
import { Effect, Schema } from "effect"

import { Contact } from "../domain/models.js"

/**
 * Wiersz tabeli `contacts` — kształt brany z kontraktu, więc nowe pole
 * w `Contact` wymusza zmianę tutaj. Różnica jest jedna: znaczniki czasu
 * przychodzą z pg jako `Date`, nie jako tekst. Nazwy kolumn aliasowane
 * w SQL-u, bez automatycznej transformacji.
 */
const ContactRow = Schema.Struct({
  ...Contact.fields,
  createdAt: Schema.DateTimeUtcFromDate,
  updatedAt: Schema.DateTimeUtcFromDate
})

export class ContactsRepository extends Effect.Service<ContactsRepository>()(
  "ContactsRepository",
  {
    effect: Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient

      const findAll = SqlSchema.findAll({
        Request: Schema.Void,
        Result: ContactRow,
        execute: () => sql`
          select
            id,
            name,
            role,
            phone,
            created_at as "createdAt",
            updated_at as "updatedAt"
          from contacts
          order by name, id
        `
      })

      return { findAll: () => findAll() } as const
    }),
    dependencies: []
  }
) {}
