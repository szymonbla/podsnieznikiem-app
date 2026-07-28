import { SqlClient, SqlSchema } from "@effect/sql"
import { Effect, Option, Schema } from "effect"

import { ContactNotFound } from "../domain/errors.js"
import {
  Contact,
  ContactId,
  CreateContactBody,
  UpdateContactBody
} from "../domain/models.js"

/**
 * A row of the `contacts` table — the shape comes from the contract, so a new
 * field on `Contact` forces a change here. There is one difference: timestamps
 * arrive from pg as `Date`, not as text. Column names are aliased in the SQL,
 * with no automatic transformation.
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
       * An omitted field stays unchanged — `coalesce` on the parameter handles
       * that without stitching the SQL together from fragments, so there is one
       * query and it is always the same. `updated_at` is set unconditionally:
       * the modification stamp describes the write, not how many fields fit
       * into it.
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
       * Deleting a contact that does not exist is a `ContactNotFound`, not a
       * silent 204 — the owner is looking at a stale list and should be told
       * (DESIGN.md §8).
       */
      const remove = (id: ContactId) =>
        sql`delete from contacts where id = ${id} returning id`.pipe(
          Effect.flatMap((rows) =>
            rows.length === 0 ? new ContactNotFound({ id }) : Effect.void
          )
        )

      return {
        findAll: () => findAll(),
        create,
        update,
        remove
      } as const
    }),
    dependencies: []
  }
) {}
