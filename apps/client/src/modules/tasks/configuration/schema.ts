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
export const taskFormFieldFromPath = (path: ReadonlyArray<PropertyKey>): TaskFormField | undefined => {
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
  intervalValue: { required: "Podaj liczbę", range: "Liczba musi być większa od zera" },
  anchorDate: { required: "Podaj datę początkową" }
} as const

const requiredText = (message: string) =>
  z.string({ error: message }).trim().min(1, { error: message })
    .max(TASK_LIMITS.description.max, { error: taskFormMessages.description.tooLong })

/** Parses a required, ranged integer out of a raw string form field. `undefined` = empty, `null` = out of range. */
const requiredInt = (raw: string | undefined, min: number, max: number): number | undefined | null => {
  if (raw === undefined || raw.trim() === "") return undefined
  const parsed = Number(raw)
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : null
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
    const require = (path: string, ok: boolean, message: string) => {
      if (!ok) ctx.addIssue({ code: "custom", path: [path], message })
    }

    if (values.type === "once") require("date", (values.date ?? "").trim() !== "", taskFormMessages.date.required)

    if (values.type === "weekly") {
      const weekday = requiredInt(values.weekday, 1, 7)
      require("weekday", weekday !== undefined && weekday !== null, taskFormMessages.weekday.required)
    }

    if (values.type === "monthly") {
      const dayOfMonth = requiredInt(values.dayOfMonth, 1, 31)
      require("dayOfMonth", dayOfMonth !== undefined, taskFormMessages.dayOfMonth.required)
      require("dayOfMonth", dayOfMonth !== null, taskFormMessages.dayOfMonth.range)
    }

    if (values.type === "yearly") {
      const month = requiredInt(values.month, 1, 12)
      require("month", month !== undefined && month !== null, taskFormMessages.month.required)
      const day = requiredInt(values.day, 1, 31)
      require("day", day !== undefined, taskFormMessages.day.required)
      require("day", day !== null, taskFormMessages.day.range)
    }

    if (values.type === "custom") {
      const intervalValue = requiredInt(values.intervalValue, 1, Number.MAX_SAFE_INTEGER)
      require("intervalValue", intervalValue !== undefined, taskFormMessages.intervalValue.required)
      require("intervalValue", intervalValue !== null, taskFormMessages.intervalValue.range)
      require("anchorDate", (values.anchorDate ?? "").trim() !== "", taskFormMessages.anchorDate.required)
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
