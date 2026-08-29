import { describe, expect, test } from "bun:test"

import { DRAFT_ID_PREFIX, draftTask, isDraft } from "../domain/drafts"

describe("a task without an identity from the database", () => {
  test("a freshly built draft is recognised as one", () => {
    const draft = draftTask({ description: "Przegląd pieca", recurrence: { type: "once", date: "2026-12-01" } })
    expect(isDraft(draft)).toBe(true)
    expect(draft.id.startsWith(DRAFT_ID_PREFIX)).toBe(true)
  })

  test("two drafts from the same data get different local ids", () => {
    const body = { description: "Przegląd pieca", recurrence: { type: "once" as const, date: "2026-12-01" } }
    expect(draftTask(body).id).not.toBe(draftTask(body).id)
  })

  test("has no due date yet — the server has not computed one", () => {
    const draft = draftTask({ description: "X", recurrence: { type: "once", date: "2026-12-01" } })
    expect(draft.dueDate).toBe("")
    expect(draft.overdue).toBe(false)
    expect(draft.done).toBe(false)
  })
})
