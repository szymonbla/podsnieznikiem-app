import { describe, expect, test } from "bun:test"
import { Effect } from "effect"

import { withServer } from "../../../__tests__/harness.js"

describe("contact list", () => {
  test("returns an empty list when there is no contact", () =>
    withServer(({ client }) =>
      Effect.gen(function* () {
        const contacts = yield* client.contacts.list()

        expect(contacts).toEqual([])
      })
    ))

  test("returns every contact from the database with all its fields", () =>
    withServer(({ client, sql }) =>
      Effect.gen(function* () {
        yield* sql`
          insert into contacts (name, role, phone)
          values ('Grzegorz Sobczak', 'Złota rączka', '602118447')
        `

        const contacts = yield* client.contacts.list()

        expect(contacts).toHaveLength(1)
        expect(contacts[0]).toMatchObject({
          name: "Grzegorz Sobczak",
          role: "Złota rączka",
          phone: "602118447"
        })
        expect(contacts[0]!.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
        )

        const rows = yield* sql`select count(*)::int as count from contacts`
        expect(rows[0]).toEqual({ count: 1 })
      })
    ))

  test("orders contacts by name, whatever the insertion order", () =>
    withServer(({ client, sql }) =>
      Effect.gen(function* () {
        yield* sql`
          insert into contacts (name, role, phone) values
            ('Zofia Wilk', 'Sprzątanie', '511222333'),
            ('Anna Kowalska', 'Księgowa', '600100200'),
            ('Marek Nowak', 'Hydraulik', '512345678')
        `

        const contacts = yield* client.contacts.list()

        expect(contacts.map((contact) => contact.name)).toEqual([
          "Anna Kowalska",
          "Marek Nowak",
          "Zofia Wilk"
        ])
      })
    ))

  test("ignores query parameters — the endpoint always returns the whole set", () =>
    withServer(({ baseUrl, sql }) =>
      Effect.gen(function* () {
        yield* sql`
          insert into contacts (name, role, phone) values
            ('Anna Kowalska', 'Księgowa', '600100200'),
            ('Marek Nowak', 'Hydraulik', '512345678')
        `

        const response = yield* Effect.promise(() =>
          fetch(`${baseUrl}/contacts?q=anna&sort=phone`)
        )
        const body = (yield* Effect.promise(() => response.json())) as ReadonlyArray<unknown>

        expect(response.status).toBe(200)
        expect(body).toHaveLength(2)
      })
    ))
})

describe("API documentation", () => {
  test("serves Swagger UI at /docs", () =>
    withServer(({ baseUrl }) =>
      Effect.gen(function* () {
        const response = yield* Effect.promise(() => fetch(`${baseUrl}/docs`))
        const html = yield* Effect.promise(() => response.text())

        expect(response.status).toBe(200)
        expect(html).toContain("swagger")
      })
    ))

  test("derives OpenAPI from the API definition — it contains the contacts path", () =>
    withServer(({ baseUrl }) =>
      Effect.gen(function* () {
        const response = yield* Effect.promise(() => fetch(`${baseUrl}/docs/openapi.json`))
        const document = (yield* Effect.promise(() => response.json())) as {
          paths: Record<string, Record<string, unknown>>
        }

        expect(response.status).toBe(200)
        expect(document.paths["/contacts"]).toHaveProperty("get")
      })
    ))
})
