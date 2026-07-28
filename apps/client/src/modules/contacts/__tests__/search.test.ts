import { describe, expect, test } from "bun:test"

import { aContact } from "../../../__tests__/contact-builder"
import { matchesQuery } from "../integration/search"

const hydraulik = aContact({
  name: "Marek Nowak",
  role: "Hydraulik",
  phone: "602118447"
})

describe("dopasowanie kontaktu do zapytania", () => {
  test("covers all three fields at once — the owner does not pick what to search by", () => {
    expect(matchesQuery(hydraulik, "Nowak")).toBe(true)
    expect(matchesQuery(hydraulik, "Hydraulik")).toBe(true)
    expect(matchesQuery(hydraulik, "602118447")).toBe(true)
  })

  test("ignores letter case, including in Polish characters", () => {
    expect(matchesQuery(aContact({ role: "Księgowa" }), "KSIĘGOWA")).toBe(true)
    expect(matchesQuery(hydraulik, "hYdRaUlIk")).toBe(true)
  })

  test("catches a fragment, not only a whole word", () => {
    expect(matchesQuery(hydraulik, "owa")).toBe(true)
    expect(matchesQuery(hydraulik, "2118")).toBe(true)
  })

  test("a number pasted with spaces, dashes and a prefix matches just the same", () => {
    expect(matchesQuery(hydraulik, "602 118 447")).toBe(true)
    expect(matchesQuery(hydraulik, "602-118-447")).toBe(true)
    expect(matchesQuery(hydraulik, "+48 602 118 447")).toBe(true)
    expect(matchesQuery(hydraulik, "+48 602 118")).toBe(true)
  })

  test("a digit lost among letters is not a query about a number", () => {
    // "mar1" should match a name or nothing — not every number containing a one.
    expect(matchesQuery(hydraulik, "mar1")).toBe(false)
    expect(matchesQuery(hydraulik, "hydraulik2")).toBe(false)
  })

  test("rejects what is in none of the three fields", () => {
    expect(matchesQuery(hydraulik, "ślusarz")).toBe(false)
    expect(matchesQuery(hydraulik, "999999999")).toBe(false)
  })
})
