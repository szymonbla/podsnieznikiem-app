import { describe, expect, test } from "bun:test"

import { currentOccurrence } from "../domain/recurrence.js"
import type { IsoDate } from "../domain/recurrence.js"

const iso = (value: string) => value as IsoDate

describe("a one-time task", () => {
  test("its occurrence is always its own date, future or past", () => {
    expect(currentOccurrence({ type: "once", date: iso("2026-11-17") }, iso("2026-01-01"))).toBe(
      "2026-11-17"
    )
    expect(currentOccurrence({ type: "once", date: iso("2026-11-17") }, iso("2027-01-01"))).toBe(
      "2026-11-17"
    )
  })
})

describe("a weekly task", () => {
  test("today, when today is the given weekday", () => {
    // 2026-11-16 is a Monday
    expect(
      currentOccurrence({ type: "weekly", weekday: 1 }, iso("2026-11-16"))
    ).toBe("2026-11-16")
  })

  test("the most recent past occurrence of the weekday otherwise", () => {
    // 2026-11-20 is a Friday; the most recent Monday is 2026-11-16
    expect(
      currentOccurrence({ type: "weekly", weekday: 1 }, iso("2026-11-20"))
    ).toBe("2026-11-16")
  })

  test("crosses a month boundary backwards", () => {
    // 2026-12-01 is a Tuesday; the most recent Sunday (7) is 2026-11-29
    expect(
      currentOccurrence({ type: "weekly", weekday: 7 }, iso("2026-12-01"))
    ).toBe("2026-11-29")
  })
})

describe("a monthly task", () => {
  test("this month's day, once it has arrived", () => {
    expect(
      currentOccurrence({ type: "monthly", dayOfMonth: 15 }, iso("2026-11-20"))
    ).toBe("2026-11-15")
  })

  test("falls back to last month's day before this month's has arrived", () => {
    expect(
      currentOccurrence({ type: "monthly", dayOfMonth: 15 }, iso("2026-11-10"))
    ).toBe("2026-10-15")
  })

  test("clamps the 31st to February's last day in a common year", () => {
    expect(
      currentOccurrence({ type: "monthly", dayOfMonth: 31 }, iso("2026-02-28"))
    ).toBe("2026-02-28")
  })

  test("clamps the 31st to February's 29th in a leap year", () => {
    expect(
      currentOccurrence({ type: "monthly", dayOfMonth: 31 }, iso("2028-02-29"))
    ).toBe("2028-02-29")
  })

  test("falls back to January's 31st, not a clamped February value, right before March", () => {
    // dayOfMonth 31: February clamps to 28/29, but the fallback month is
    // January (unclamped 31), not a re-clamp of February.
    expect(
      currentOccurrence({ type: "monthly", dayOfMonth: 31 }, iso("2026-02-15"))
    ).toBe("2026-01-31")
  })
})

describe("a yearly task", () => {
  test("this year's date, once it has arrived", () => {
    expect(
      currentOccurrence({ type: "yearly", month: 11, day: 17 }, iso("2026-11-20"))
    ).toBe("2026-11-17")
  })

  test("falls back to last year's date before this year's has arrived", () => {
    expect(
      currentOccurrence({ type: "yearly", month: 11, day: 17 }, iso("2026-01-05"))
    ).toBe("2025-11-17")
  })

  test("29 February clamps to the 28th in a non-leap year", () => {
    expect(
      currentOccurrence({ type: "yearly", month: 2, day: 29 }, iso("2026-03-01"))
    ).toBe("2026-02-28")
  })

  test("29 February lands exactly in a leap year", () => {
    expect(
      currentOccurrence({ type: "yearly", month: 2, day: 29 }, iso("2028-03-01"))
    ).toBe("2028-02-29")
  })
})
