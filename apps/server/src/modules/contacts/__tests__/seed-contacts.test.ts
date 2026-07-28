import { describe, expect, test } from "bun:test"
import { SqlClient } from "@effect/sql"
import { Effect, Layer } from "effect"

import { withServer } from "../../../__tests__/harness.js"
import { ContactsRepository, seedContacts } from "../index.js"

/** The command gets its repository from the application layer; the test wires it the same way. */
const seed = (sql: SqlClient.SqlClient) =>
  seedContacts.pipe(
    Effect.provide(
      Layer.provide(ContactsRepository.Default, Layer.succeed(SqlClient.SqlClient, sql))
    )
  )

const hasPolishCharacters = (value: string) => /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(value)

describe("sample data", () => {
  test("loads the full set of 24 contacts into an empty database", () =>
    withServer(({ client, sql }) =>
      Effect.gen(function* () {
        const inserted = yield* seed(sql)

        expect(inserted).toBe(24)

        const contacts = yield* client.contacts.list()
        expect(contacts).toHaveLength(24)
      })
    ))

  test("does not create a duplicate set on a repeat run", () =>
    withServer(({ client, sql }) =>
      Effect.gen(function* () {
        yield* seed(sql)
        const inserted = yield* seed(sql)

        expect(inserted).toBe(0)

        const contacts = yield* client.contacts.list()
        expect(contacts).toHaveLength(24)
      })
    ))

  test("leaves manually added contacts in the database", () =>
    withServer(({ client, sql }) =>
      Effect.gen(function* () {
        yield* sql`
          insert into contacts (name, role, phone)
          values ('Wiesław Zaremba', 'Kominiarz', '600100200')
        `

        yield* seed(sql)

        const contacts = yield* client.contacts.list()
        expect(contacts).toHaveLength(25)
      })
    ))

  test("loads a number repeated across two roles of one person", () =>
    withServer(({ client, sql }) =>
      Effect.gen(function* () {
        yield* seed(sql)

        const contacts = yield* client.contacts.list()
        const byPhone = new Map<string, number>()
        for (const contact of contacts) {
          byPhone.set(contact.phone, (byPhone.get(contact.phone) ?? 0) + 1)
        }
        const repeated = contacts.filter((contact) => byPhone.get(contact.phone)! > 1)

        expect(repeated).toHaveLength(2)
        expect(repeated[0]!.name).toBe(repeated[1]!.name)
        expect(repeated[0]!.role).not.toBe(repeated[1]!.role)
      })
    ))

  test("loads Polish characters without mangling them", () =>
    withServer(({ client, sql }) =>
      Effect.gen(function* () {
        yield* seed(sql)

        const contacts = yield* client.contacts.list()

        expect(contacts.some((contact) => hasPolishCharacters(contact.name))).toBe(true)
        expect(contacts.some((contact) => hasPolishCharacters(contact.role))).toBe(true)
      })
    ))
})
