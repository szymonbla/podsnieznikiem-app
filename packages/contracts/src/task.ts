import { Schema } from "effect"

export const TaskId = Schema.UUID.pipe(Schema.brand("TaskId"))
export type TaskId = typeof TaskId.Type

export const TaskDescription = Schema.String.pipe(
  Schema.trimmed(),
  Schema.minLength(1),
  Schema.maxLength(200)
)

/** A calendar date without a time or a zone — `YYYY-MM-DD` (spec 0002 → model). */
export const IsoDate = Schema.String.pipe(Schema.pattern(/^\d{4}-\d{2}-\d{2}$/))
export type IsoDate = typeof IsoDate.Type

const Weekday = Schema.Int.pipe(Schema.between(1, 7))
const DayOfMonth = Schema.Int.pipe(Schema.between(1, 31))
const Month = Schema.Int.pipe(Schema.between(1, 12))
const IntervalValue = Schema.Int.pipe(Schema.between(1, 1000))
const IntervalUnit = Schema.Literal("days", "weeks", "months")

export const OnceRecurrence = Schema.Struct({
  type: Schema.Literal("once"),
  date: IsoDate
})

export const WeeklyRecurrence = Schema.Struct({
  type: Schema.Literal("weekly"),
  /** 1 = Monday … 7 = Sunday (spec 0002 → model). */
  weekday: Weekday
})

export const MonthlyRecurrence = Schema.Struct({
  type: Schema.Literal("monthly"),
  dayOfMonth: DayOfMonth
})

export const YearlyRecurrence = Schema.Struct({
  type: Schema.Literal("yearly"),
  month: Month,
  day: DayOfMonth
})

export const CustomRecurrence = Schema.Struct({
  type: Schema.Literal("custom"),
  intervalValue: IntervalValue,
  intervalUnit: IntervalUnit,
  anchorDate: IsoDate
})

export const Recurrence = Schema.Union(
  OnceRecurrence,
  WeeklyRecurrence,
  MonthlyRecurrence,
  YearlyRecurrence,
  CustomRecurrence
)
export type Recurrence = typeof Recurrence.Type

export const Task = Schema.Struct({
  id: TaskId,
  description: TaskDescription,
  recurrence: Recurrence,
  /** The occurrence the owner last confirmed done — not the click date (spec 0002 → model). */
  completedThrough: Schema.NullOr(IsoDate),
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc
})
export type Task = typeof Task.Type

/**
 * What every read endpoint actually returns: the stored task plus the fields
 * computed against today (spec 0002 → "Wyznaczanie bieżącego wystąpienia").
 * The client decodes only this shape — it never sees a bare `Task`.
 */
export const TaskView = Schema.Struct({
  ...Task.fields,
  dueDate: IsoDate,
  overdue: Schema.Boolean,
  done: Schema.Boolean
})
export type TaskView = typeof TaskView.Type

export const CreateTaskBody = Schema.Struct({
  description: Schema.Trim.pipe(Schema.minLength(1), Schema.maxLength(200)),
  recurrence: Recurrence
})
export type CreateTaskBody = typeof CreateTaskBody.Type

/** Partial like Kontakty's update — description and/or the whole recurrence rule, never a merge of the two. */
export const UpdateTaskBody = Schema.partial(CreateTaskBody)
export type UpdateTaskBody = typeof UpdateTaskBody.Type
