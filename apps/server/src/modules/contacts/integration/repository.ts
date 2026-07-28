import { SqlClient, SqlSchema } from "@effect/sql"
import { Effect, Option, Schema } from "effect"

import { ContactNotFound } from "../domain/errors.js"
import {
  Contact,
  ContactId,
  CreateContactBody,
  UpdateContactBody
} from "../domain/models.js"
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

      const create = SqlSchema.single({
        Request: CreateContactBody,
        Result: ContactRow,
        execute: (body) => sql`
          insert into contacts ${sql.insert({
            name: body.name,
            role: body.role,
            phone: body.phone
          })}
          returning
            id,
            name,
            role,
            phone,
            created_at as "createdAt",
            updated_at as "updatedAt"
        `
      })

      /**
       * Pominięte pole zostaje bez zmian — `coalesce` na parametrze załatwia to
       * bez sklejania SQL-a z fragmentów, więc zapytanie jest jedno i zawsze
       * to samo. `updated_at` idzie wprost: znacznik modyfikacji opisuje zapis,
       * nie to, ile pól się w nim zmieściło.
       */
      const updateFields = SqlSchema.findOne({
        Request: Schema.Struct({ id: ContactId, body: UpdateContactBody }),
        Result: ContactRow,
        execute: ({ id, body }) => sql`
          update contacts set
            name  = coalesce(${body.name ?? null}, name),
            role  = coalesce(${body.role ?? null}, role),
            phone = coalesce(${body.phone ?? null}, phone),
            updated_at = now()
          where id = ${id}
          returning
            id,
            name,
            role,
            phone,
            created_at as "createdAt",
            updated_at as "updatedAt"
        `
      })

      const update = (id: ContactId, body: UpdateContactBody) =>
        updateFields({ id, body }).pipe(
          Effect.flatMap(
            Option.match({
              onNone: () => new ContactNotFound({ id }),
              onSome: Effect.succeed
            })
          )
        )

      /**
       * Usunięcie nieistniejącego kontaktu to `ContactNotFound`, a nie ciche
       * 204 — właściciel patrzy wtedy na nieaktualną listę i ma się o tym
       * dowiedzieć (DESIGN.md §8).
       */
      const remove = (id: ContactId) =>
        sql`delete from contacts where id = ${id} returning id`.pipe(
          Effect.flatMap((rows) =>
            rows.length === 0 ? new ContactNotFound({ id }) : Effect.void
          )
        )

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

      return {
        findAll: () => findAll(),
        create,
        update,
        remove,
        insertManyUnlessIdentical
      } as const
    }),
    dependencies: []
  }
) {}
