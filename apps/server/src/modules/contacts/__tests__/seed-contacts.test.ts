import { describe, expect, test } from "bun:test"
import { SqlClient } from "@effect/sql"
import { Effect, Layer } from "effect"

import { withServer } from "../../../__tests__/harness.js"
import { ContactsRepository, seedContacts } from "../index.js"

/** Komenda dostaje repozytorium z warstwy aplikacji; test wiąże je tak samo. */
const seed = (sql: SqlClient.SqlClient) =>
  seedContacts.pipe(
    Effect.provide(
      Layer.provide(ContactsRepository.Default, Layer.succeed(SqlClient.SqlClient, sql))
    )
  )

const hasPolishCharacters = (value: string) => /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(value)

describe("dane przykładowe", () => {
  test("wgrywa komplet 24 kontaktów do pustej bazy", () =>
    withServer(({ client, sql }) =>
      Effect.gen(function* () {
        const inserted = yield* seed(sql)

        expect(inserted).toBe(24)

        const contacts = yield* client.contacts.list()
        expect(contacts).toHaveLength(24)
      })
    ))

  test("nie tworzy zdublowanego zestawu przy ponownym uruchomieniu", () =>
    withServer(({ client, sql }) =>
      Effect.gen(function* () {
        yield* seed(sql)
        const inserted = yield* seed(sql)

        expect(inserted).toBe(0)

        const contacts = yield* client.contacts.list()
        expect(contacts).toHaveLength(24)
      })
    ))

  test("zostawia w bazie kontakty dodane ręcznie", () =>
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

  test("wgrywa numer powtórzony przy dwóch specjalizacjach jednej osoby", () =>
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

  test("wgrywa polskie znaki bez zniekształceń", () =>
    withServer(({ client, sql }) =>
      Effect.gen(function* () {
        yield* seed(sql)

        const contacts = yield* client.contacts.list()

        expect(contacts.some((contact) => hasPolishCharacters(contact.name))).toBe(true)
        expect(contacts.some((contact) => hasPolishCharacters(contact.role))).toBe(true)
      })
    ))
})
