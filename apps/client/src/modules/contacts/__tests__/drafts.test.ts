import { describe, expect, test } from "bun:test"

import { aContact } from "../../../__tests__/contact-builder"
import { DRAFT_ID_PREFIX, draftContact, isDraft } from "../domain/drafts"

describe("a contact without an identity from the database", () => {
  test("a freshly built draft is recognised as one", () => {
    const draft = draftContact({ name: "Anna Kot", role: "Hydraulik", phone: "602118447" })

    expect(isDraft(draft)).toBe(true)
    expect(draft.id.startsWith(DRAFT_ID_PREFIX)).toBe(true)
  })

  test("a contact carrying a database id is not a draft", () => {
    expect(isDraft(aContact({ id: "3f1c8a2e-0000-4000-8000-000000000001" }))).toBe(false)
  })

  test("two drafts made from the same data get different local ids", () => {
    const body = { name: "Anna Kot", role: "Hydraulik", phone: "602118447" }

    expect(draftContact(body).id).not.toBe(draftContact(body).id)
  })

  test("the owner's data is carried over untouched, with timestamps filled in", () => {
    const draft = draftContact({ name: "Anna Kot", role: "Hydraulik", phone: "602118447" })

    expect(draft.name).toBe("Anna Kot")
    expect(draft.role).toBe("Hydraulik")
    expect(draft.phone).toBe("602118447")
    expect(Number.isNaN(Date.parse(draft.createdAt))).toBe(false)
    expect(draft.updatedAt).toBe(draft.createdAt)
  })
})
