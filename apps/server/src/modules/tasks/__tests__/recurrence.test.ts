import { describe, expect, test } from "bun:test"

import { currentOccurrence, isoDateFromEpochMillis, taskOccurrence } from "../domain/recurrence.js"
import type { IsoDate } from "../domain/models.js"

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

describe("a custom-interval task", () => {
  test("steps by days from the anchor", () => {
    const r = { type: "custom", intervalValue: 3, intervalUnit: "days", anchorDate: iso("2026-11-01") } as const
    expect(currentOccurrence(r, iso("2026-11-08"))).toBe("2026-11-07")
  })

  test("steps by weeks from the anchor", () => {
    const r = { type: "custom", intervalValue: 2, intervalUnit: "weeks", anchorDate: iso("2026-11-01") } as const
    expect(currentOccurrence(r, iso("2026-11-20"))).toBe("2026-11-15")
  })

  test("an anchor in the future extrapolates the same interval backwards", () => {
    const r = { type: "custom", intervalValue: 5, intervalUnit: "days", anchorDate: iso("2026-12-01") } as const
    expect(currentOccurrence(r, iso("2026-11-20"))).toBe("2026-11-16")
  })

  test("steps by calendar months, not 30-day periods", () => {
    const r = { type: "custom", intervalValue: 1, intervalUnit: "months", anchorDate: iso("2026-01-31") } as const
    // Jan 31 -> clamp Feb 28 -> Mar 31 -> clamp Apr 30 -> ...
    expect(currentOccurrence(r, iso("2026-04-15"))).toBe("2026-03-31")
  })

  test("crosses a year boundary stepping by months", () => {
    const r = { type: "custom", intervalValue: 3, intervalUnit: "months", anchorDate: iso("2026-11-30") } as const
    expect(currentOccurrence(r, iso("2027-01-15"))).toBe("2026-11-30")
  })
})

describe("the view combining an occurrence with completion", () => {
  test("overdue when the due date has passed and not completed for it", () => {
    const r = { type: "once", date: iso("2026-11-17") } as const
    expect(taskOccurrence(r, null, iso("2026-11-20"))).toEqual({
      dueDate: "2026-11-17",
      overdue: true,
      done: false
    })
  })

  test("done when completedThrough matches the current occurrence", () => {
    const r = { type: "weekly", weekday: 1 } as const
    expect(taskOccurrence(r, iso("2026-11-16"), iso("2026-11-16"))).toMatchObject({ done: true })
  })

  test("a stale completion (an earlier occurrence) does not count as done", () => {
    const r = { type: "weekly", weekday: 1 } as const
    expect(taskOccurrence(r, iso("2026-11-09"), iso("2026-11-16"))).toMatchObject({ done: false })
  })

  test("epoch millis convert to the UTC calendar date", () => {
    expect(isoDateFromEpochMillis(Date.UTC(2026, 10, 17, 23, 59))).toBe("2026-11-17")
  })
})
