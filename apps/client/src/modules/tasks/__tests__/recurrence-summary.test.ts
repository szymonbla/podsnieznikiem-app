import { describe, expect, test } from "bun:test"

import { formatDueDate, recurrenceSummary } from "../presentation/copy"

describe("formatting a due date", () => {
  test("YYYY-MM-DD becomes DD.MM.YYYY", () => {
    expect(formatDueDate("2026-11-17")).toBe("17.11.2026")
  })
})

describe("summarising a recurrence rule", () => {
  test("once", () => {
    expect(recurrenceSummary({ type: "once", date: "2026-12-01" })).toBe("Raz — 01.12.2026")
  })
  test("weekly", () => {
    expect(recurrenceSummary({ type: "weekly", weekday: 1 })).toBe("Co tydzień — poniedziałek")
  })
  test("monthly", () => {
    expect(recurrenceSummary({ type: "monthly", dayOfMonth: 15 })).toBe("Co miesiąc — 15. dnia")
  })
  test("yearly, matching the spec's own example", () => {
    expect(recurrenceSummary({ type: "yearly", month: 11, day: 17 })).toBe("Co rok — 17 listopada")
  })
  test("custom in days, singular", () => {
    expect(recurrenceSummary({ type: "custom", intervalValue: 1, intervalUnit: "days", anchorDate: "2026-01-01" })).toBe("Co 1 dzień")
  })
  test("custom in weeks, the 2-4 form", () => {
    expect(recurrenceSummary({ type: "custom", intervalValue: 3, intervalUnit: "weeks", anchorDate: "2026-01-01" })).toBe("Co 3 tygodnie")
  })
  test("custom in months, the 12-14 exception", () => {
    expect(recurrenceSummary({ type: "custom", intervalValue: 12, intervalUnit: "months", anchorDate: "2026-01-01" })).toBe("Co 12 miesięcy")
  })
})
