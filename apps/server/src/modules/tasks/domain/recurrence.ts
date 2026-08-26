import type { IsoDate, Recurrence } from "./models.js"

interface DateParts {
  readonly year: number
  readonly month: number // 1-12
  readonly day: number
}

const pad = (value: number, width: number): string => String(value).padStart(width, "0")

/**
 * `IsoDate` is a fixed `YYYY-MM-DD` shape — a calendar arithmetic step that
 * lands outside a 4-digit year, or produces a non-finite part (e.g. from an
 * epoch day so large `Date` returns Invalid Date → `NaN`), can't be encoded
 * as one. Throwing here turns that into a loud 500 on the single offending
 * request instead of a silently corrupt `IsoDate` string reaching storage or
 * the `TaskView` encoder (see Zadania final-review finding 1).
 */
const toIso = (parts: DateParts): IsoDate => {
  const { year, month, day } = parts
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    year < 0 ||
    year > 9999 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    throw new Error(
      `recurrence: computed a calendar date outside the representable IsoDate range (year=${year}, month=${month}, day=${day})`
    )
  }
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}` as IsoDate
}

const fromIso = (iso: IsoDate): DateParts => {
  const [year, month, day] = iso.split("-").map(Number)
  return { year: year ?? 0, month: month ?? 1, day: day ?? 1 }
}

const MS_PER_DAY = 86_400_000

/** UTC has no DST — safe ground for pure calendar arithmetic (no `new Date()` diffing). */
const toEpochDay = (parts: DateParts): number =>
  Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / MS_PER_DAY)

const fromEpochDay = (epochDay: number): DateParts => {
  if (!Number.isFinite(epochDay)) {
    throw new Error(`recurrence: computed a non-finite epoch day (${epochDay})`)
  }
  const date = new Date(epochDay * MS_PER_DAY)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`recurrence: epoch day ${epochDay} is outside the range Date can represent`)
  }
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

const customDaysOccurrence = (anchor: DateParts, stepDays: number, today: DateParts): DateParts => {
  const steps = Math.floor((toEpochDay(today) - toEpochDay(anchor)) / stepDays)
  return fromEpochDay(toEpochDay(anchor) + steps * stepDays)
}

/** Calendar months, not fixed-length periods — the 31st stays the 31st, or the month's last day. */
const customMonthsOccurrence = (anchor: DateParts, stepMonths: number, today: DateParts): DateParts => {
  const anchorIndex = anchor.year * 12 + (anchor.month - 1)
  const todayIndex = today.year * 12 + (today.month - 1)
  let steps = Math.floor((todayIndex - anchorIndex) / stepMonths)

  while (compareParts(addMonths(anchor, steps * stepMonths), today) > 0) steps -= 1
  while (compareParts(addMonths(anchor, (steps + 1) * stepMonths), today) <= 0) steps += 1

  return addMonths(anchor, steps * stepMonths)
}

const customOccurrence = (
  recurrence: Extract<Recurrence, { type: "custom" }>,
  today: DateParts
): DateParts => {
  const anchor = fromIso(recurrence.anchorDate)
  if (recurrence.intervalUnit === "months") return customMonthsOccurrence(anchor, recurrence.intervalValue, today)

  const stepDays = recurrence.intervalUnit === "weeks" ? recurrence.intervalValue * 7 : recurrence.intervalValue
  return customDaysOccurrence(anchor, stepDays, today)
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
      return toIso(customOccurrence(recurrence, todayParts))
  }
}

export interface TaskOccurrence {
  readonly dueDate: IsoDate
  readonly overdue: boolean
  readonly done: boolean
}

export const taskOccurrence = (
  recurrence: Recurrence,
  completedThrough: IsoDate | null,
  today: IsoDate
): TaskOccurrence => {
  const dueDate = currentOccurrence(recurrence, today)
  return { dueDate, overdue: dueDate < today, done: completedThrough === dueDate }
}

/** Today, in the server's one timezone (UTC) — the only place epoch millis become a calendar date. */
export const isoDateFromEpochMillis = (epochMillis: number): IsoDate => {
  const epochDay = Math.floor(epochMillis / MS_PER_DAY)
  return toIso(fromEpochDay(epochDay))
}
