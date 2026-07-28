import { http, HttpResponse, type HttpHandler } from "msw"
import { setupServer } from "msw/node"

import type { Contact } from "../modules/contacts"

/**
 * A server standing in for the API — the network is seam 2's only stubbed
 * boundary. It lives apart from `harness.tsx` because the preload drives its
 * lifecycle (one listener per process), and the preload must not pull in a
 * React tree before the DOM is registered.
 *
 * The `*` in the handler paths settles the base URL — the client hits a
 * relative `/api`, and the test need not know the origin happy-dom runs on.
 */
export const mockApi = setupServer()

export const apiHandlers = {
  contacts: (contacts: ReadonlyArray<Contact>): HttpHandler =>
    http.get("*/api/contacts", () => HttpResponse.json(contacts)),

  /** A dead connection — the request never arrives, so there is not even a status. */
  contactsUnreachable: (): HttpHandler =>
    http.get("*/api/contacts", () => HttpResponse.error()),

  /**
   * A request that never comes back — the only way for a test to catch the
   * loading state. The unsettled promise disappears with the test process.
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
 * An API with memory — the list really grows, changes and shrinks per request.
 * Without that, a create test would see only the optimistic preview and would
 * pass even when the `POST` never arrives.
 *
 * The "server" assigns the `id`, so a restored contact gets a new identity —
 * just like in the database (ADR-0003).
 */
export const contactsApi = (
  initial: ReadonlyArray<Contact> = [],
  /** The failure the API should return instead of writing — for the error paths. */
  failWith?: { readonly status: 400 | 404 | 500; readonly body: Record<string, unknown> }
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

      contacts = contacts.filter((contact) => contact.id !== existing.id)

      return new HttpResponse(null, { status: 204 })
    })
  ]

  return { handlers, requests, current: () => contacts }
}
