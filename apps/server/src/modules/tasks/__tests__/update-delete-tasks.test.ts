// apps/server/src/modules/tasks/__tests__/update-delete-tasks.test.ts
import { describe, expect, test } from "bun:test"
import { Effect, TestClock } from "effect"

import { withClockControlledServer as withServer } from "../../../__tests__/harness.js"
import type { TaskId } from "../domain/models.js"

const anId = (value: string) => value as TaskId

describe("editing a task", () => {
  test("changes the description and leaves the recurrence unchanged", () =>
    withServer(({ client }) =>
      Effect.gen(function* () {
        yield* TestClock.setTime(Date.UTC(2026, 10, 20))
        const created = yield* client.tasks.create({
          payload: { description: "Faktura", recurrence: { type: "monthly", dayOfMonth: 1 } }
        })

        const updated = yield* client.tasks.update({
          path: { id: created.id },
          payload: { description: "Faktura do księgowej" }
        })

        expect(updated).toMatchObject({ description: "Faktura do księgowej", recurrence: { type: "monthly", dayOfMonth: 1 } })
      })
    ))

  test("swaps the whole recurrence rule when given a new one", () =>
    withServer(({ client }) =>
      Effect.gen(function* () {
        yield* TestClock.setTime(Date.UTC(2026, 10, 20))
        const created = yield* client.tasks.create({
          payload: { description: "Ubezpieczenie", recurrence: { type: "once", date: "2026-12-01" } }
        })

        const updated = yield* client.tasks.update({
          path: { id: created.id },
          payload: { recurrence: { type: "yearly", month: 11, day: 17 } }
        })

        expect(updated.recurrence).toEqual({ type: "yearly", month: 11, day: 17 })
      })
    ))

  test("reports a missing task", () =>
    withServer(({ client }) =>
      Effect.gen(function* () {
        const result = yield* Effect.either(
          client.tasks.update({ path: { id: anId("00000000-0000-4000-8000-000000000000") }, payload: { description: "X" } })
        )
        expect(result._tag).toBe("Left")
        if (result._tag === "Left") expect(result.left._tag).toBe("TaskNotFound")
      })
    ))
})

describe("deleting a task", () => {
  test("deletes permanently, and a re-create gets a new id", () =>
    withServer(({ client, sql }) =>
      Effect.gen(function* () {
        const original = yield* client.tasks.create({
          payload: { description: "Odśnieżanie", recurrence: { type: "once", date: "2026-12-01" } }
        })

        yield* client.tasks.remove({ path: { id: original.id } })

        const rows = yield* sql`select count(*)::int as count from tasks`
        expect(rows[0]).toEqual({ count: 0 })

        const restored = yield* client.tasks.create({
          payload: { description: "Odśnieżanie", recurrence: { type: "once", date: "2026-12-01" } }
        })
        expect(restored.id).not.toBe(original.id)
      })
    ))

  test("reports a missing task", () =>
    withServer(({ client }) =>
      Effect.gen(function* () {
        const result = yield* Effect.either(client.tasks.remove({ path: { id: anId("00000000-0000-4000-8000-000000000000") } }))
        expect(result._tag).toBe("Left")
        if (result._tag === "Left") expect(result.left._tag).toBe("TaskNotFound")
      })
    ))
})
