import { SqlClient, SqlSchema } from "@effect/sql"
import { Effect, Schema } from "effect"

import { Contact } from "../domain/models.js"
import type { SampleContact } from "./seed-data.js"

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

      const insertUnlessIdentical = (contact: SampleContact) =>
        sql`
          insert into contacts (name, role, phone)
          select ${contact.name}, ${contact.role}, ${contact.phone}
          where not exists (
            select 1 from contacts
            where name = ${contact.name}
              and role = ${contact.role}
              and phone = ${contact.phone}
          )
          returning id
        `.pipe(Effect.map((rows) => rows.length))

      /**
       * Wstawia te kontakty, których identyczna trójka (nazwa, specjalizacja,
       * numer) jeszcze w bazie nie leży, i zwraca liczbę dodanych. Sam numer
       * nie rozstrzyga — nie jest unikalny (CONTEXT.md → Telefon). Całość
       * w jednej transakcji, żeby zwrócona liczba opisywała stan bazy także
       * wtedy, gdy któryś wiersz się nie uda.
       */
      const insertManyUnlessIdentical = (contacts: ReadonlyArray<SampleContact>) =>
        Effect.forEach(contacts, insertUnlessIdentical, { concurrency: 1 }).pipe(
          Effect.map((counts) => counts.reduce((total, count) => total + count, 0)),
          sql.withTransaction
        )

      return { findAll: () => findAll(), insertManyUnlessIdentical } as const
    }),
    dependencies: []
  }
) {}
