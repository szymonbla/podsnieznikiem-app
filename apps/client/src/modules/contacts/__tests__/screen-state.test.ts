import { describe, expect, test } from "bun:test"

import { hasRows, isReady, screenState, type ScreenState } from "../domain/screen-state"

const states = (...values: ReadonlyArray<ScreenState>): ReadonlyArray<ScreenState> => values

/**
 * The order of the checks is a rule, not an accident of how the JSX happens to
 * nest: a connection error must not be reported as an empty list, and an empty
 * list must not be reported as a filter that found nothing. The rule is checked
 * here without rendering anything — a state named on its own is cheaper to pin
 * down than a screen with a stubbed API.
 */
describe("what the screen shows", () => {
  test("loading beats everything — nothing is known yet", () => {
    expect(screenState({ isPending: true, isError: true, total: 0, matches: 0 })).toBe("loading")
  })

  test("an error beats emptiness — a list that failed to load is not a list of none", () => {
    expect(screenState({ isPending: false, isError: true, total: 0, matches: 0 })).toBe("error")
  })

  test("emptiness beats the filter — with no contacts at all the filter has nothing to blame", () => {
    expect(screenState({ isPending: false, isError: false, total: 0, matches: 0 })).toBe("empty")
  })

  test("the filter speaks up only when there is something it could have matched", () => {
    expect(screenState({ isPending: false, isError: false, total: 3, matches: 0 })).toBe(
      "no-matches"
    )
  })

  test("with matches the list shows", () => {
    expect(screenState({ isPending: false, isError: false, total: 3, matches: 2 })).toBe("list")
  })

  test("the filter and the counter appear once there is something to count", () => {
    expect(states("no-matches", "list").every(hasRows)).toBe(true)
    expect(states("loading", "error", "empty").some(hasRows)).toBe(false)
  })

  test("adding stays quiet until the list is known", () => {
    expect(states("loading", "error").some(isReady)).toBe(false)
    expect(states("empty", "no-matches", "list").every(isReady)).toBe(true)
  })
})
