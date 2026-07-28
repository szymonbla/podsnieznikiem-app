import { describe, expect, test } from "bun:test"
import { Effect } from "effect"

import { withServer } from "../../../__tests__/harness.js"
import type { ContactId } from "../domain/models.js"

/** Identyfikator, którego w bazie na pewno nie ma — do ścieżek „nie znaleziono". */
const anId = (value: string) => value as ContactId

describe("tworzenie kontaktu", () => {
  test("tworzy kontakt z kompletu trzech pól i zapisuje go w bazie", () =>
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

  test("nie pozwala utworzyć kontaktu bez specjalizacji", () =>
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

  test("nie pozwala utworzyć kontaktu z numerem o złej długości", () =>
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

  test("przycina białe znaki wokół nazwiska i specjalizacji", () =>
    withServer(({ baseUrl, sql }) =>
      Effect.gen(function* () {
        /*
         * Surowy `fetch`, nie typowany klient: ten wysyłałby ciąg już przycięty,
         * bo przycięcie jest częścią kontraktu. Badane jest wejście takie, jakie
         * naprawdę przychodzi po sieci z formularza.
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

  test("dopuszcza dwa kontakty o tym samym numerze — jedna osoba, dwa fachy", () =>
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

describe("edycja kontaktu", () => {
  test("zmienia wskazane pole i zostawia pominięte bez zmian", () =>
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

  test("odświeża znacznik modyfikacji przy zapisie", () =>
    withServer(({ client, sql }) =>
      Effect.gen(function* () {
        const created = yield* client.contacts.create({
          payload: { name: "Marek Nowak", role: "Hydraulik", phone: "512345678" }
        })

        /* Cofnięcie znacznika w bazie zastępuje czekanie na upływ czasu. */
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

  test("zgłasza nieodnaleziony kontakt przy edycji nieistniejącego wpisu", () =>
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

describe("usuwanie kontaktu", () => {
  test("usuwa kontakt trwale — po restarcie zapytania nie ma po nim śladu", () =>
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

  test("zgłasza nieodnaleziony kontakt przy usuwaniu nieistniejącego wpisu", () =>
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

  test("odtworzony kontakt wraca z nowym identyfikatorem, nie ze starym", () =>
    withServer(({ client }) =>
      Effect.gen(function* () {
        const original = yield* client.contacts.create({
          payload: { name: "Marek Nowak", role: "Hydraulik", phone: "512345678" }
        })

        yield* client.contacts.remove({ path: { id: original.id } })

        /* „Cofnij" to powtórne utworzenie z zapamiętanych danych (ADR-0003). */
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
