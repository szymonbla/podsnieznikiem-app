import { describe, expect, test } from "bun:test"
import { Effect, TestClock } from "effect"

import { withClockControlledServer as withServer } from "../../../__tests__/harness.js"

describe("marking a task done", () => {
  test("hides it — done becomes true for the current occurrence", () =>
    withServer(({ client }) =>
      Effect.gen(function* () {
        yield* TestClock.setTime(Date.UTC(2026, 10, 16)) // Monday
        const created = yield* client.tasks.create({
          payload: { description: "Wynieś śmieci", recurrence: { type: "weekly", weekday: 1 } }
        })

        const completed = yield* client.tasks.complete({ path: { id: created.id } })

        expect(completed).toMatchObject({ dueDate: "2026-11-16", done: true, overdue: false })
      })
    ))

  test("a recurring task reappears on its own once the next occurrence arrives", () =>
    withServer(({ client }) =>
      Effect.gen(function* () {
        yield* TestClock.setTime(Date.UTC(2026, 10, 16))
        const created = yield* client.tasks.create({
          payload: { description: "Wynieś śmieci", recurrence: { type: "weekly", weekday: 1 } }
        })
        yield* client.tasks.complete({ path: { id: created.id } })

        yield* TestClock.setTime(Date.UTC(2026, 10, 23)) // next Monday
        const [task] = yield* client.tasks.list()

        expect(task).toMatchObject({ dueDate: "2026-11-23", done: false })
      })
    ))

  test("uncomplete clears the marker without touching the recurrence", () =>
    withServer(({ client }) =>
      Effect.gen(function* () {
        yield* TestClock.setTime(Date.UTC(2026, 10, 16))
        const created = yield* client.tasks.create({
          payload: { description: "Wynieś śmieci", recurrence: { type: "weekly", weekday: 1 } }
        })
        yield* client.tasks.complete({ path: { id: created.id } })

        const uncompleted = yield* client.tasks.uncomplete({ path: { id: created.id } })

        expect(uncompleted).toMatchObject({ done: false, dueDate: "2026-11-16" })
      })
    ))

  test("reports a missing task on complete and on uncomplete", () =>
    withServer(({ client }) =>
      Effect.gen(function* () {
        const id = "00000000-0000-4000-8000-000000000000" as never
        const completeResult = yield* Effect.either(client.tasks.complete({ path: { id } }))
        const uncompleteResult = yield* Effect.either(client.tasks.uncomplete({ path: { id } }))
        expect(completeResult._tag).toBe("Left")
        expect(uncompleteResult._tag).toBe("Left")
      })
    ))
})
