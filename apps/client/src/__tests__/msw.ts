import { http, HttpResponse, type HttpHandler } from "msw"
import { setupServer } from "msw/node"

import type { Contact } from "../modules/contacts"
import type { Task } from "../modules/tasks"

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

export const taskApiHandlers = {
  tasks: (tasks: ReadonlyArray<Task>): HttpHandler => http.get("*/api/tasks", () => HttpResponse.json(tasks)),
  tasksUnreachable: (): HttpHandler => http.get("*/api/tasks", () => HttpResponse.error()),
  tasksPending: (): HttpHandler => http.get("*/api/tasks", () => new Promise<never>(() => {}))
}

interface TaskWriteBody { readonly description?: string; readonly recurrence?: unknown }

export const tasksApi = (
  initial: ReadonlyArray<Task> = [],
  failWith?: { readonly status: 400 | 404 | 500; readonly body: Record<string, unknown> }
) => {
  let tasks = [...initial]
  let sequence = 0
  const requests: Array<{ method: string; body: TaskWriteBody }> = []
  const stamp = "2026-02-01T12:00:00.000Z"

  const fail = () => failWith !== undefined
  const failure = () => HttpResponse.json(failWith?.body ?? {}, { status: failWith?.status ?? 500 })

  const handlers: ReadonlyArray<HttpHandler> = [
    http.get("*/api/tasks", () => HttpResponse.json(tasks)),
    http.post("*/api/tasks", async ({ request }) => {
      const body = (await request.json()) as TaskWriteBody
      requests.push({ method: "POST", body })
      if (fail()) return failure()
      if (body.description === undefined || body.recurrence === undefined) {
        return HttpResponse.json({ issues: [{ path: ["description"], message: "is missing" }] }, { status: 400 })
      }
      sequence += 1
      const created: Task = {
        id: `created-${sequence}`, description: body.description, recurrence: body.recurrence as Task["recurrence"],
        completedThrough: null, dueDate: "2026-12-01", overdue: false, done: false, createdAt: stamp, updatedAt: stamp
      }
      tasks = [...tasks, created]
      return HttpResponse.json(created, { status: 201 })
    }),
    http.patch("*/api/tasks/:id", async ({ request, params }) => {
      const body = (await request.json()) as TaskWriteBody
      requests.push({ method: "PATCH", body })
      if (fail()) return failure()
      const existing = tasks.find((task) => task.id === params["id"])
      if (existing === undefined) return HttpResponse.json({ _tag: "TaskNotFound", id: String(params["id"]) }, { status: 404 })
      const updated: Task = { ...existing, ...body, recurrence: (body.recurrence as Task["recurrence"]) ?? existing.recurrence, updatedAt: stamp }
      tasks = tasks.map((task) => (task.id === updated.id ? updated : task))
      return HttpResponse.json(updated)
    }),
    http.delete("*/api/tasks/:id", ({ params }) => {
      requests.push({ method: "DELETE", body: {} })
      if (fail()) return failure()
      const existing = tasks.find((task) => task.id === params["id"])
      if (existing === undefined) return HttpResponse.json({ _tag: "TaskNotFound", id: String(params["id"]) }, { status: 404 })
      tasks = tasks.filter((task) => task.id !== existing.id)
      return new HttpResponse(null, { status: 204 })
    }),
    http.post("*/api/tasks/:id/complete", ({ params }) => {
      requests.push({ method: "COMPLETE", body: {} })
      if (fail()) return failure()
      const existing = tasks.find((task) => task.id === params["id"])
      if (existing === undefined) return HttpResponse.json({ _tag: "TaskNotFound", id: String(params["id"]) }, { status: 404 })
      const updated = { ...existing, done: true, completedThrough: existing.dueDate }
      tasks = tasks.map((task) => (task.id === updated.id ? updated : task))
      return HttpResponse.json(updated)
    }),
    http.post("*/api/tasks/:id/uncomplete", ({ params }) => {
      requests.push({ method: "UNCOMPLETE", body: {} })
      if (fail()) return failure()
      const existing = tasks.find((task) => task.id === params["id"])
      if (existing === undefined) return HttpResponse.json({ _tag: "TaskNotFound", id: String(params["id"]) }, { status: 404 })
      const updated = { ...existing, done: false, completedThrough: null }
      tasks = tasks.map((task) => (task.id === updated.id ? updated : task))
      return HttpResponse.json(updated)
    })
  ]

  return { handlers, requests, current: () => tasks }
}
