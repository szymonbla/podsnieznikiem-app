import { describe, expect, test } from "bun:test"

import { isReady, screenState } from "../domain/screen-state"

describe("what the tasks screen shows", () => {
  test("loading beats everything", () => {
    expect(screenState({ isPending: true, isError: true, total: 0 })).toBe("loading")
  })
  test("an error beats emptiness", () => {
    expect(screenState({ isPending: false, isError: true, total: 0 })).toBe("error")
  })
  test("no tasks shows the empty state", () => {
    expect(screenState({ isPending: false, isError: false, total: 0 })).toBe("empty")
  })
  test("otherwise the list shows", () => {
    expect(screenState({ isPending: false, isError: false, total: 3 })).toBe("list")
  })
  test("adding stays quiet until the list is known", () => {
    expect(isReady("loading")).toBe(false)
    expect(isReady("error")).toBe(false)
    expect(isReady("empty")).toBe(true)
    expect(isReady("list")).toBe(true)
  })
})
