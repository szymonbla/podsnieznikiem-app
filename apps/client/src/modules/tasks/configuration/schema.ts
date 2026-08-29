import { z } from "zod"

import type { CreateTaskBody } from "../domain/models"
import { TASK_LIMITS } from "./constraints"

export const RECURRENCE_TYPES = ["once", "weekly", "monthly", "yearly", "custom"] as const
export type RecurrenceTypeOption = (typeof RECURRENCE_TYPES)[number]
export const INTERVAL_UNITS = ["days", "weeks", "months"] as const

export const TASK_FORM_FIELDS = [
  "description", "date", "weekday", "dayOfMonth", "month", "day", "intervalValue", "intervalUnit", "anchorDate"
] as const
export type TaskFormField = (typeof TASK_FORM_FIELDS)[number]

export const isTaskFormField = (value: unknown): value is TaskFormField =>
  typeof value === "string" && TASK_FORM_FIELDS.includes(value as TaskFormField)

/** Server validation errors point at `recurrence.<field>` or `description` — this is where one becomes a form field. */
export const taskFormFieldFromPath = (path: ReadonlyArray<unknown>): TaskFormField | undefined => {
  const [first, second] = path
  if (first === "recurrence" && isTaskFormField(second)) return second
  return isTaskFormField(first) ? first : undefined
}

export const taskFormMessages = {
  description: { required: "Opisz zadanie", tooLong: `Opis może mieć najwyżej ${TASK_LIMITS.description.max} znaków` },
  date: { required: "Podaj datę" },
  weekday: { required: "Wybierz dzień tygodnia" },
  dayOfMonth: { required: "Podaj dzień miesiąca", range: "Dzień miesiąca musi być liczbą od 1 do 31" },
  month: { required: "Wybierz miesiąc" },
  day: { required: "Podaj dzień", range: "Dzień musi być liczbą od 1 do 31" },
  intervalValue: { required: "Podaj liczbę", range: "Liczba musi być z zakresu od 1 do 1000" },
  anchorDate: { required: "Podaj datę początkową" }
} as const

const requiredText = (message: string) =>
  z.string({ error: message }).trim().min(1, { error: message })
    .max(TASK_LIMITS.description.max, { error: taskFormMessages.description.tooLong })

/** Parses a required, ranged integer out of a raw string form field. `undefined` = empty, `null` = out of range. */
const parseRangedInt = (raw: string | undefined, min: number, max: number): number | undefined | null => {
  if (raw === undefined || raw.trim() === "") return undefined
  const parsed = Number(raw)
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : null
}

type RawField = "date" | "weekday" | "dayOfMonth" | "month" | "day" | "intervalValue" | "anchorDate"

interface TextRule { readonly kind: "text"; readonly key: RawField; readonly required: string }
interface IntRule {
  readonly kind: "int"; readonly key: RawField; readonly min: number; readonly max: number
  readonly required: string; readonly range: string
}
type FieldRule = TextRule | IntRule

/**
 * The single source of truth for what each recurrence type requires — drives
 * `superRefine` below. Previously this lived twice (once as `if` branches in
 * the refinement, once implicitly in the transform's field reads), and the
 * two copies had already drifted: `weekday`/`month` collapsed "empty" and
 * "out of range" into one message while the others split them. That
 * asymmetry is preserved here (unchanged product behaviour) but now stated
 * once, so it can't silently diverge again.
 */
const RECURRENCE_FIELDS: Readonly<Record<RecurrenceTypeOption, ReadonlyArray<FieldRule>>> = {
  once: [{ kind: "text", key: "date", required: taskFormMessages.date.required }],
  weekly: [{
    kind: "int", key: "weekday", min: 1, max: 7,
    required: taskFormMessages.weekday.required, range: taskFormMessages.weekday.required
  }],
  monthly: [{
    kind: "int", key: "dayOfMonth", min: 1, max: 31,
    required: taskFormMessages.dayOfMonth.required, range: taskFormMessages.dayOfMonth.range
  }],
  yearly: [
    { kind: "int", key: "month", min: 1, max: 12, required: taskFormMessages.month.required, range: taskFormMessages.month.required },
    { kind: "int", key: "day", min: 1, max: 31, required: taskFormMessages.day.required, range: taskFormMessages.day.range }
  ],
  custom: [
    {
      kind: "int", key: "intervalValue", min: 1, max: 1000,
      required: taskFormMessages.intervalValue.required, range: taskFormMessages.intervalValue.range
    },
    { kind: "text", key: "anchorDate", required: taskFormMessages.anchorDate.required }
  ]
}

export const taskFormSchema = z
  .object({
    description: requiredText(taskFormMessages.description.required),
    type: z.enum(RECURRENCE_TYPES),
    date: z.string().optional(),
    weekday: z.string().optional(),
    dayOfMonth: z.string().optional(),
    month: z.string().optional(),
    day: z.string().optional(),
    intervalValue: z.string().optional(),
    intervalUnit: z.enum(INTERVAL_UNITS).optional(),
    anchorDate: z.string().optional()
  })
  .superRefine((values, ctx) => {
    for (const field of RECURRENCE_FIELDS[values.type]) {
      if (field.kind === "text") {
        if ((values[field.key] ?? "").trim() === "") {
          ctx.addIssue({ code: "custom", path: [field.key], message: field.required })
        }
        continue
      }

      const parsed = parseRangedInt(values[field.key], field.min, field.max)
      if (parsed === undefined) ctx.addIssue({ code: "custom", path: [field.key], message: field.required })
      else if (parsed === null) ctx.addIssue({ code: "custom", path: [field.key], message: field.range })
    }
  })
  .transform((values): CreateTaskBody => {
    const description = values.description
    switch (values.type) {
      case "once":
        return { description, recurrence: { type: "once", date: values.date ?? "" } }
      case "weekly":
        return { description, recurrence: { type: "weekly", weekday: Number(values.weekday) } }
      case "monthly":
        return { description, recurrence: { type: "monthly", dayOfMonth: Number(values.dayOfMonth) } }
      case "yearly":
        return { description, recurrence: { type: "yearly", month: Number(values.month), day: Number(values.day) } }
      case "custom":
        return {
          description,
          recurrence: {
            type: "custom",
            intervalValue: Number(values.intervalValue),
            intervalUnit: values.intervalUnit ?? "days",
            anchorDate: values.anchorDate ?? ""
          }
        }
    }
  })

export type TaskFormValues = z.input<typeof taskFormSchema>
export type TaskFormOutput = z.output<typeof taskFormSchema>

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false
type Expect<T extends true> = T
type _EnsureContract = Expect<Equal<TaskFormOutput, CreateTaskBody>>
