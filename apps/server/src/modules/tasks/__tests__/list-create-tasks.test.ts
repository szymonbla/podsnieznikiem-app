import { describe, expect, test } from "bun:test"
import { Effect, TestClock } from "effect"

import { withServer } from "../../../__tests__/harness.js"

describe("listing tasks", () => {
  test("returns an empty list when there is no task", () =>
    withServer(({ client }) =>
      Effect.gen(function* () {
        expect(yield* client.tasks.list()).toEqual([])
      })
    ))
})

describe("creating a task", () => {
  test("a one-time task is overdue once its date has passed", () =>
    withServer(({ client }) =>
      Effect.gen(function* () {
        yield* TestClock.setTime(Date.UTC(2026, 10, 20))

        const created = yield* client.tasks.create({
          payload: { description: "Przegląd pieca", recurrence: { type: "once", date: "2026-11-17" } }
        })

        expect(created).toMatchObject({ description: "Przegląd pieca", dueDate: "2026-11-17", overdue: true, done: false })
      })
    ))

  test("a weekly task's due date is the most recent matching weekday", () =>
    withServer(({ client }) =>
      Effect.gen(function* () {
        yield* TestClock.setTime(Date.UTC(2026, 10, 20)) // Friday

        const created = yield* client.tasks.create({
          payload: { description: "Wynieś śmieci", recurrence: { type: "weekly", weekday: 1 } }
        })

        expect(created).toMatchObject({ dueDate: "2026-11-16", overdue: true, done: false })
      })
    ))

  test("a monthly task clamps the 31st in a 30-day month", () =>
    withServer(({ client }) =>
      Effect.gen(function* () {
        yield* TestClock.setTime(Date.UTC(2026, 3, 30)) // 2026-04-30

        const created = yield* client.tasks.create({
          payload: { description: "Faktura księgowej", recurrence: { type: "monthly", dayOfMonth: 31 } }
        })

        expect(created.dueDate).toBe("2026-04-30")
      })
    ))

  test("a custom-interval task steps by calendar months from the anchor", () =>
    withServer(({ client }) =>
      Effect.gen(function* () {
        yield* TestClock.setTime(Date.UTC(2026, 5, 1))

        const created = yield* client.tasks.create({
          payload: {
            description: "Przegląd gaśnic",
            recurrence: { type: "custom", intervalValue: 3, intervalUnit: "months", anchorDate: "2026-01-01" }
          }
        })

        expect(created.dueDate).toBe("2026-04-01")
      })
    ))

  test("rejects a weekday outside 1-7", () =>
    withServer(({ baseUrl, sql }) =>
      Effect.promise(async () => {
        const response = await fetch(`${baseUrl}/tasks`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ description: "X", recurrence: { type: "weekly", weekday: 8 } })
        })
        expect(response.status).toBe(400)
      }).pipe(Effect.flatMap(() => sql`select count(*)::int as count from tasks`), Effect.map((rows) => {
        expect(rows[0]).toEqual({ count: 0 })
      }))
    ))

  test("rejects a custom interval below 1", () =>
    withServer(({ baseUrl }) =>
      Effect.promise(async () => {
        const response = await fetch(`${baseUrl}/tasks`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            description: "X",
            recurrence: { type: "custom", intervalValue: 0, intervalUnit: "days", anchorDate: "2026-01-01" }
          })
        })
        expect(response.status).toBe(400)
      })
    ))
})
