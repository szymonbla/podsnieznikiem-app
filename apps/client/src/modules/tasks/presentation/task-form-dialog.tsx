import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useEffect, useId } from "react"
import { useForm, type UseFormRegisterReturn } from "react-hook-form"

import { Button } from "../../../libs/ui/button"
import { Input } from "../../../libs/ui/input"
import { Label } from "../../../libs/ui/label"
import { Select } from "../../../libs/ui/select"
import { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "../../../libs/ui/sheet"
import { isTaskFormField, taskFormSchema, type TaskFormOutput, type TaskFormValues } from "../configuration/schema"
import type { Task } from "../domain/models"
import { MONTH_OPTIONS, RECURRENCE_TYPE_OPTIONS, WEEKDAY_OPTIONS, INTERVAL_UNIT_OPTIONS, tasksCopy } from "./copy"

interface TaskFormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly task?: Task
  readonly onSubmit: (values: TaskFormOutput) => Promise<Partial<Readonly<Record<string, string>>> | undefined>
  readonly pending: boolean
}

const EMPTY: TaskFormValues = {
  description: "", type: "once", date: "", weekday: "", dayOfMonth: "",
  month: "", day: "", intervalValue: "", intervalUnit: "days", anchorDate: ""
}

const valuesFromTask = (task: Task): TaskFormValues => {
  const r = task.recurrence
  return {
    description: task.description,
    type: r.type,
    date: r.type === "once" ? r.date : "",
    weekday: r.type === "weekly" ? String(r.weekday) : "",
    dayOfMonth: r.type === "monthly" ? String(r.dayOfMonth) : "",
    month: r.type === "yearly" ? String(r.month) : "",
    day: r.type === "yearly" ? String(r.day) : "",
    intervalValue: r.type === "custom" ? String(r.intervalValue) : "",
    intervalUnit: r.type === "custom" ? r.intervalUnit : "days",
    anchorDate: r.type === "custom" ? r.anchorDate : ""
  }
}

const Field = ({ label, registration, error, type = "text" }: {
  readonly label: string; readonly registration: UseFormRegisterReturn
  readonly error: string | undefined; readonly type?: "text" | "date" | "number"
}) => {
  const id = useId()
  return (
    <Label className="flex flex-col items-start gap-1.5">
      <span>{label}</span>
      <Input {...registration} type={type} aria-invalid={error !== undefined} {...(error === undefined ? {} : { "aria-describedby": `${id}-error` })} />
      {error !== undefined ? <span id={`${id}-error`} role="alert" className="text-2xs font-medium text-destructive">{error}</span> : null}
    </Label>
  )
}

const SelectField = ({ label, registration, error, options, placeholder }: {
  readonly label: string; readonly registration: UseFormRegisterReturn; readonly error: string | undefined
  readonly options: ReadonlyArray<{ readonly value: string; readonly label: string }>; readonly placeholder?: string
}) => {
  const id = useId()
  return (
    <Label className="flex flex-col items-start gap-1.5">
      <span>{label}</span>
      <Select {...registration} aria-invalid={error !== undefined} {...(error === undefined ? {} : { "aria-describedby": `${id}-error` })}>
        {placeholder === undefined ? null : <option value="">{placeholder}</option>}
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </Select>
      {error !== undefined ? <span id={`${id}-error`} role="alert" className="text-2xs font-medium text-destructive">{error}</span> : null}
    </Label>
  )
}

export const TaskFormDialog = ({ open, onOpenChange, task, onSubmit, pending }: TaskFormDialogProps) => {
  const mode = task === undefined ? "create" : "edit"
  const copy = tasksCopy.form[mode]

  const { register, handleSubmit, reset, setError, watch, formState: { errors } } = useForm<TaskFormValues, unknown, TaskFormOutput>({
    resolver: standardSchemaResolver(taskFormSchema), mode: "onBlur", defaultValues: EMPTY
  })

  useEffect(() => {
    if (!open) return
    reset(task === undefined ? EMPTY : valuesFromTask(task))
  }, [open, task, reset])

  const type = watch("type")

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby="task-form-description">
        <form
          noValidate
          onSubmit={(event) => {
            void handleSubmit(async (values) => {
              const serverErrors = await onSubmit(values)
              for (const [field, message] of Object.entries(serverErrors ?? {})) {
                if (message !== undefined && isTaskFormField(field)) setError(field, { message })
              }
            })(event)
          }}
          className="flex h-full flex-col"
        >
          <SheetHeader>
            <SheetTitle>{copy.title}</SheetTitle>
            <SheetDescription id="task-form-description">{copy.description}</SheetDescription>
          </SheetHeader>

          <SheetBody>
            <Field label={tasksCopy.form.fields.description} registration={register("description")} error={errors.description?.message} />
            <SelectField label={tasksCopy.form.fields.type} registration={register("type")} error={undefined} options={RECURRENCE_TYPE_OPTIONS} />

            {type === "once" ? <Field label={tasksCopy.form.fields.date} type="date" registration={register("date")} error={errors.date?.message} /> : null}

            {type === "weekly" ? (
              <SelectField label={tasksCopy.form.fields.weekday} registration={register("weekday")} error={errors.weekday?.message}
                options={WEEKDAY_OPTIONS} placeholder={tasksCopy.form.placeholders.weekday} />
            ) : null}

            {type === "monthly" ? (
              <Field label={tasksCopy.form.fields.dayOfMonth} type="number" registration={register("dayOfMonth")} error={errors.dayOfMonth?.message} />
            ) : null}

            {type === "yearly" ? (
              <>
                <SelectField label={tasksCopy.form.fields.month} registration={register("month")} error={errors.month?.message}
                  options={MONTH_OPTIONS} placeholder={tasksCopy.form.placeholders.month} />
                <Field label={tasksCopy.form.fields.day} type="number" registration={register("day")} error={errors.day?.message} />
              </>
            ) : null}

            {type === "custom" ? (
              <>
                <Field label={tasksCopy.form.fields.intervalValue} type="number" registration={register("intervalValue")} error={errors.intervalValue?.message} />
                <SelectField label={tasksCopy.form.fields.intervalUnit} registration={register("intervalUnit")} error={undefined} options={INTERVAL_UNIT_OPTIONS} />
                <Field label={tasksCopy.form.fields.anchorDate} type="date" registration={register("anchorDate")} error={errors.anchorDate?.message} />
              </>
            ) : null}
          </SheetBody>

          <SheetFooter>
            <SheetClose asChild><Button type="button" variant="outline">{tasksCopy.form.cancel}</Button></SheetClose>
            <Button type="submit" disabled={pending}>{copy.submit}</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
