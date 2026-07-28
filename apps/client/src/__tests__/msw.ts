import { http, HttpResponse, type HttpHandler } from "msw"
import { setupServer } from "msw/node"

import type { Contact } from "../modules/contacts"

/**
 * Serwer podszywający się pod API — sieć jest jedyną podstawioną granicą szwu 2.
 * Mieszka osobno od `harness.tsx`, bo jego cyklem życia steruje preload (jeden
 * nasłuch na proces), a preload nie może wciągać drzewa Reacta przed
 * zarejestrowaniem DOM-u.
 *
 * `*` w ścieżkach handlerów rozstrzyga adres bazowy — klient uderza pod
 * względne `/api`, a test nie musi znać originu, na którym stoi happy-dom.
 */
export const mockApi = setupServer()

export const apiHandlers = {
  contacts: (contacts: ReadonlyArray<Contact>): HttpHandler =>
    http.get("*/api/contacts", () => HttpResponse.json(contacts)),

  /** Padnięte połączenie — żądanie nie dochodzi, więc nie ma nawet statusu. */
  contactsUnreachable: (): HttpHandler =>
    http.get("*/api/contacts", () => HttpResponse.error()),

  /**
   * Żądanie, które nigdy nie wraca — jedyny sposób, żeby test zdążył zobaczyć
   * stan ładowania. Obietnica bez rozstrzygnięcia znika razem z procesem testu.
   */
  contactsPending: (): HttpHandler =>
    http.get("*/api/contacts", () => new Promise<never>(() => {}))
}

interface WriteBody {
  readonly name?: string
  readonly role?: string
  readonly phone?: string
}

/**
 * API z pamięcią — lista naprawdę rośnie, zmienia się i kurczy po żądaniu.
 * Bez tego test dodania widziałby tylko podgląd optymistyczny i przechodziłby
 * także wtedy, gdy `POST` w ogóle nie dochodzi.
 *
 * `id` nadaje „serwer", więc odtworzony kontakt dostaje nową tożsamość — tak
 * jak w bazie (ADR-0003).
 */
export const contactsApi = (
  initial: ReadonlyArray<Contact> = [],
  /** Awaria, którą API ma odesłać zamiast wykonać zapis — do ścieżek błędnych. */
  failWith?: { readonly status: 400 | 404; readonly body: Record<string, unknown> }
) => {
  let contacts = [...initial]
  let sequence = 0
  const requests: Array<{ method: string; body: WriteBody }> = []

  const stamp = "2026-02-01T12:00:00.000Z"

  const handlers: ReadonlyArray<HttpHandler> = [
    http.get("*/api/contacts", () => HttpResponse.json(contacts)),

    http.post("*/api/contacts", async ({ request }) => {
      const body = (await request.json()) as WriteBody
      requests.push({ method: "POST", body })

      if (failWith !== undefined) {
        return HttpResponse.json(failWith.body, { status: failWith.status })
      }

      if (body.name === undefined || body.role === undefined || body.phone === undefined) {
        return HttpResponse.json({ issues: [{ path: ["role"], message: "is missing" }] }, { status: 400 })
      }

      sequence += 1
      const created: Contact = {
        id: `created-${sequence}`,
        name: body.name,
        role: body.role,
        phone: body.phone,
        createdAt: stamp,
        updatedAt: stamp
      }
      contacts = [...contacts, created]

      return HttpResponse.json(created, { status: 201 })
    }),

    http.patch("*/api/contacts/:id", async ({ request, params }) => {
      const body = (await request.json()) as WriteBody
      requests.push({ method: "PATCH", body })

      if (failWith !== undefined) {
        return HttpResponse.json(failWith.body, { status: failWith.status })
      }

      const existing = contacts.find((contact) => contact.id === params["id"])
      if (existing === undefined) {
        return HttpResponse.json(
          { _tag: "ContactNotFound", id: String(params["id"]) },
          { status: 404 }
        )
      }

      const updated: Contact = { ...existing, ...body, updatedAt: stamp }
      contacts = contacts.map((contact) => (contact.id === updated.id ? updated : contact))

      return HttpResponse.json(updated)
    }),

    http.delete("*/api/contacts/:id", ({ params }) => {
      requests.push({ method: "DELETE", body: {} })

      const existing = contacts.find((contact) => contact.id === params["id"])
      if (existing === undefined) {
        return HttpResponse.json(
          { _tag: "ContactNotFound", id: String(params["id"]) },
          { status: 404 }
        )
      }

      contacts = contacts.filter((contact) => contact.id !== existing.id)

      return new HttpResponse(null, { status: 204 })
    })
  ]

  return { handlers, requests, current: () => contacts }
}
