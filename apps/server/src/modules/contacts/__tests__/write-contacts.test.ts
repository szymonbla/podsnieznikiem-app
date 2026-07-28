import { describe, expect, test } from "bun:test"
import { Effect } from "effect"

import { withServer } from "../../../__tests__/harness.js"
import type { ContactId } from "../domain/models.js"

/** An id that is certainly not in the database — for the "not found" paths. */
const anId = (value: string) => value as ContactId

describe("creating a contact", () => {
  test("creates a contact from all three fields and stores it in the database", () =>
    withServer(({ client, sql }) =>
      Effect.gen(function* () {
        const created = yield* client.contacts.create({
          payload: { name: "Marek Nowak", role: "Hydraulik", phone: "512345678" }
        })

        expect(created).toMatchObject({
          name: "Marek Nowak",
          role: "Hydraulik",
          phone: "512345678"
        })

        const rows = yield* sql`select name, role, phone from contacts`
        expect(rows).toEqual([
          { name: "Marek Nowak", role: "Hydraulik", phone: "512345678" }
        ])
      })
    ))

  test("refuses to create a contact without a role", () =>
    withServer(({ baseUrl, sql }) =>
      Effect.gen(function* () {
        const response = yield* Effect.promise(() =>
          fetch(`${baseUrl}/contacts`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: "Marek Nowak", phone: "512345678" })
          })
        )

        expect(response.status).toBe(400)

        const rows = yield* sql`select count(*)::int as count from contacts`
        expect(rows[0]).toEqual({ count: 0 })
      })
    ))

  test("refuses to create a contact with a wrong-length phone number", () =>
    withServer(({ baseUrl, sql }) =>
      Effect.gen(function* () {
        const response = yield* Effect.promise(() =>
          fetch(`${baseUrl}/contacts`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              name: "Marek Nowak",
              role: "Hydraulik",
              phone: "51234"
            })
          })
        )

        expect(response.status).toBe(400)

        const rows = yield* sql`select count(*)::int as count from contacts`
        expect(rows[0]).toEqual({ count: 0 })
      })
    ))

  test("trims whitespace around the name and the role", () =>
    withServer(({ baseUrl, sql }) =>
      Effect.gen(function* () {
        /*
         * Raw `fetch`, not the typed client: the client would send an already
         * trimmed string, because trimming is part of the contract. What is
         * tested is the input as it really arrives over the wire from a form.
         */
        const response = yield* Effect.promise(() =>
          fetch(`${baseUrl}/contacts`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              name: "  Marek Nowak  ",
              role: " Hydraulik ",
              phone: "512345678"
            })
          })
        )
        expect(response.status).toBe(201)

        const rows = yield* sql`select name, role from contacts`
        expect(rows).toEqual([{ name: "Marek Nowak", role: "Hydraulik" }])
      })
    ))

  test("allows two contacts sharing a phone number — one person, two trades", () =>
    withServer(({ client, sql }) =>
      Effect.gen(function* () {
        yield* client.contacts.create({
          payload: { name: "Marek Nowak", role: "Hydraulik", phone: "512345678" }
        })
        yield* client.contacts.create({
          payload: { name: "Marek Nowak", role: "Elektryk", phone: "512345678" }
        })

        const rows = yield* sql`select count(*)::int as count from contacts`
        expect(rows[0]).toEqual({ count: 2 })
      })
    ))
})

describe("editing a contact", () => {
  test("changes the given field and leaves the omitted ones unchanged", () =>
    withServer(({ client, sql }) =>
      Effect.gen(function* () {
        const created = yield* client.contacts.create({
          payload: { name: "Marek Nowak", role: "Hydraulik", phone: "512345678" }
        })

        const updated = yield* client.contacts.update({
          path: { id: created.id },
          payload: { phone: "600100200" }
        })

        expect(updated).toMatchObject({
          name: "Marek Nowak",
          role: "Hydraulik",
          phone: "600100200"
        })

        const rows = yield* sql`select name, role, phone from contacts`
        expect(rows).toEqual([
          { name: "Marek Nowak", role: "Hydraulik", phone: "600100200" }
        ])
      })
    ))

  test("refreshes the modification stamp on write", () =>
    withServer(({ client, sql }) =>
      Effect.gen(function* () {
        const created = yield* client.contacts.create({
          payload: { name: "Marek Nowak", role: "Hydraulik", phone: "512345678" }
        })

        /* Pushing the stamp back in the database replaces waiting for time to pass. */
        yield* sql`update contacts set updated_at = now() - interval '1 hour'`

        const updated = yield* client.contacts.update({
          path: { id: created.id },
          payload: { role: "Elektryk" }
        })

        expect(updated.updatedAt.epochMillis).toBeGreaterThan(
          updated.createdAt.epochMillis
        )
      })
    ))

  test("reports a missing contact when editing an entry that does not exist", () =>
    withServer(({ client }) =>
      Effect.gen(function* () {
        const result = yield* Effect.either(
          client.contacts.update({
            path: { id: anId("00000000-0000-4000-8000-000000000000") },
            payload: { role: "Elektryk" }
          })
        )

        expect(result._tag).toBe("Left")
        if (result._tag === "Left") {
          expect(result.left._tag).toBe("ContactNotFound")
        }
      })
    ))
})

describe("deleting a contact", () => {
  test("deletes a contact permanently — a re-query finds no trace of it", () =>
    withServer(({ client, sql }) =>
      Effect.gen(function* () {
        const created = yield* client.contacts.create({
          payload: { name: "Marek Nowak", role: "Hydraulik", phone: "512345678" }
        })

        yield* client.contacts.remove({ path: { id: created.id } })

        const rows = yield* sql`select count(*)::int as count from contacts`
        expect(rows[0]).toEqual({ count: 0 })
        expect(yield* client.contacts.list()).toEqual([])
      })
    ))

  test("reports a missing contact when deleting an entry that does not exist", () =>
    withServer(({ client }) =>
      Effect.gen(function* () {
        const result = yield* Effect.either(
          client.contacts.remove({
            path: { id: anId("00000000-0000-4000-8000-000000000000") }
          })
        )

        expect(result._tag).toBe("Left")
        if (result._tag === "Left") {
          expect(result.left._tag).toBe("ContactNotFound")
        }
      })
    ))

  test("a restored contact comes back with a new id, not the old one", () =>
    withServer(({ client }) =>
      Effect.gen(function* () {
        const original = yield* client.contacts.create({
          payload: { name: "Marek Nowak", role: "Hydraulik", phone: "512345678" }
        })

        yield* client.contacts.remove({ path: { id: original.id } })

        /* "Undo" is a re-create from the remembered data (ADR-0003). */
        const restored = yield* client.contacts.create({
          payload: { name: "Marek Nowak", role: "Hydraulik", phone: "512345678" }
        })

        expect(restored.id).not.toBe(original.id)
        expect(restored).toMatchObject({
          name: "Marek Nowak",
          role: "Hydraulik",
          phone: "512345678"
        })
      })
    ))
})
