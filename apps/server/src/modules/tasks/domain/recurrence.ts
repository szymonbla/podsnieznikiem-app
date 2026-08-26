import type { IsoDate, Recurrence } from "@podsnieznikiem/contracts"

export type { IsoDate } from "@podsnieznikiem/contracts"

interface DateParts {
  readonly year: number
  readonly month: number // 1-12
  readonly day: number
}

const pad = (value: number, width: number): string => String(value).padStart(width, "0")

const toIso = (parts: DateParts): IsoDate =>
  `${pad(parts.year, 4)}-${pad(parts.month, 2)}-${pad(parts.day, 2)}` as IsoDate

const fromIso = (iso: IsoDate): DateParts => {
  const [year, month, day] = iso.split("-").map(Number)
  return { year: year ?? 0, month: month ?? 1, day: day ?? 1 }
}

const MS_PER_DAY = 86_400_000

/** UTC has no DST — safe ground for pure calendar arithmetic (no `new Date()` diffing). */
const toEpochDay = (parts: DateParts): number =>
  Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / MS_PER_DAY)

const fromEpochDay = (epochDay: number): DateParts => {
  const date = new Date(epochDay * MS_PER_DAY)
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() }
}

/** The last calendar day of a month — the anchor for every clamping rule below. */
const daysInMonth = (year: number, month: number): number =>
  new Date(Date.UTC(year, month, 0)).getUTCDate()

/** A day beyond the month's length falls back to the month's last day (spec 0002 → model). */
const clampDay = (year: number, month: number, day: number): number =>
  Math.min(day, daysInMonth(year, month))

const occurrenceInMonth = (year: number, month: number, day: number): DateParts => ({
  year,
  month,
  day: clampDay(year, month, day)
})

export const addMonths = (parts: DateParts, months: number): DateParts => {
  const totalMonths = parts.year * 12 + (parts.month - 1) + months
  const year = Math.floor(totalMonths / 12)
  const month = totalMonths - year * 12 + 1
  return occurrenceInMonth(year, month, parts.day)
}

const compareParts = (left: DateParts, right: DateParts): number => {
  const l = toIso(left)
  const r = toIso(right)
  return l < r ? -1 : l > r ? 1 : 0
}

/** 1 = Monday … 7 = Sunday, independent of locale. Epoch day 0 (1970-01-01) was a Thursday. */
const weekdayOf = (parts: DateParts): number => {
  const sinceThursday = ((toEpochDay(parts) % 7) + 7) % 7
  return ((sinceThursday + 3) % 7) + 1
}

const weeklyOccurrence = (weekday: number, today: DateParts): DateParts => {
  const diff = (weekdayOf(today) - weekday + 7) % 7
  return fromEpochDay(toEpochDay(today) - diff)
}

const monthlyOccurrence = (dayOfMonth: number, today: DateParts): DateParts => {
  const thisMonth = occurrenceInMonth(today.year, today.month, dayOfMonth)
  if (compareParts(thisMonth, today) <= 0) return thisMonth

  const previous = addMonths({ ...today, day: 1 }, -1)
  return occurrenceInMonth(previous.year, previous.month, dayOfMonth)
}

const yearlyOccurrence = (month: number, day: number, today: DateParts): DateParts => {
  const thisYear = occurrenceInMonth(today.year, month, day)
  if (compareParts(thisYear, today) <= 0) return thisYear

  return occurrenceInMonth(today.year - 1, month, day)
}

/**
 * The latest occurrence of `recurrence` that is not later than `today` — the
 * due date shown on the list, whatever the calendar says about whether it has
 * passed (spec 0002 → "Wyznaczanie bieżącego wystąpienia"). A one-time task
 * has exactly one occurrence ever, so it is exempt from the "not later than
 * today" search: its date is the answer, future or past.
 */
export const currentOccurrence = (recurrence: Recurrence, today: IsoDate): IsoDate => {
  const todayParts = fromIso(today)

  switch (recurrence.type) {
    case "once":
      return recurrence.date
    case "weekly":
      return toIso(weeklyOccurrence(recurrence.weekday, todayParts))
    case "monthly":
      return toIso(monthlyOccurrence(recurrence.dayOfMonth, todayParts))
    case "yearly":
      return toIso(yearlyOccurrence(recurrence.month, recurrence.day, todayParts))
    case "custom":
      // Task 3 fills this in.
      throw new Error("custom recurrence not implemented yet")
  }
}
