import { SqlClient, SqlSchema } from "@effect/sql"
import { Clock, Effect, Option, Schema } from "effect"

import { TaskNotFound } from "../domain/errors.js"
import { CreateTaskBody, IsoDate, Task, TaskId, TaskView, UpdateTaskBody } from "../domain/models.js"
import { isoDateFromEpochMillis, taskOccurrence } from "../domain/recurrence.js"

/** `pg` decodes `jsonb` columns itself, so `recurrence` arrives already parsed — decode it as structured data, not JSON text. */
const TaskRow = Schema.Struct({
  ...Task.fields,
  createdAt: Schema.DateTimeUtcFromDate,
  updatedAt: Schema.DateTimeUtcFromDate
})
type TaskRow = typeof TaskRow.Type

const COLUMNS = `
  id, description, recurrence,
  completed_through as "completedThrough",
  created_at as "createdAt",
  updated_at as "updatedAt"
`

const today: Effect.Effect<IsoDate> = Clock.currentTimeMillis.pipe(Effect.map(isoDateFromEpochMillis))

const toView = (row: TaskRow, todayValue: IsoDate): TaskView => ({
  ...row,
  ...taskOccurrence(row.recurrence, row.completedThrough, todayValue)
})

export class TasksRepository extends Effect.Service<TasksRepository>()("TasksRepository", {
  effect: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    const findAllRows = SqlSchema.findAll({
      Request: Schema.Void,
      Result: TaskRow,
      execute: () => sql`select ${sql.unsafe(COLUMNS)} from tasks order by created_at, id`
    })

    const findRowById = SqlSchema.findOne({
      Request: TaskId,
      Result: TaskRow,
      execute: (id) => sql`select ${sql.unsafe(COLUMNS)} from tasks where id = ${id}`
    })

    const insertRow = SqlSchema.single({
      Request: CreateTaskBody,
      Result: TaskRow,
      execute: (body) => sql`
        insert into tasks ${sql.insert({ description: body.description, recurrence: JSON.stringify(body.recurrence) })}
        returning ${sql.unsafe(COLUMNS)}
      `
    })

    const updateRow = SqlSchema.findOne({
      Request: Schema.Struct({ id: TaskId, body: UpdateTaskBody }),
      Result: TaskRow,
      execute: ({ id, body }) => sql`
        update tasks set
          description = coalesce(${body.description ?? null}, description),
          recurrence  = coalesce(${body.recurrence === undefined ? null : JSON.stringify(body.recurrence)}, recurrence),
          updated_at = now()
        where id = ${id}
        returning ${sql.unsafe(COLUMNS)}
      `
    })

    const setCompletedThrough = SqlSchema.findOne({
      Request: Schema.Struct({ id: TaskId, completedThrough: Schema.NullOr(IsoDate) }),
      Result: TaskRow,
      execute: ({ id, completedThrough }) => sql`
        update tasks set completed_through = ${completedThrough}, updated_at = now()
        where id = ${id}
        returning ${sql.unsafe(COLUMNS)}
      `
    })

    const orNotFound = (id: TaskId) =>
      Option.match({ onNone: () => new TaskNotFound({ id }), onSome: Effect.succeed })

    const findAll = () =>
      Effect.gen(function* () {
        const [rows, todayValue] = yield* Effect.all([findAllRows(), today])
        return rows.map((row) => toView(row, todayValue))
      })

    const create = (body: CreateTaskBody) =>
      Effect.gen(function* () {
        const [row, todayValue] = yield* Effect.all([insertRow(body), today])
        return toView(row, todayValue)
      })

    const update = (id: TaskId, body: UpdateTaskBody) =>
      Effect.gen(function* () {
        const [row, todayValue] = yield* Effect.all([updateRow({ id, body }), today])
        const found = yield* Option.match(row, { onNone: () => new TaskNotFound({ id }), onSome: Effect.succeed })
        return toView(found, todayValue)
      })

    const remove = (id: TaskId) =>
      sql`delete from tasks where id = ${id} returning id`.pipe(
        Effect.flatMap((rows) => (rows.length === 0 ? new TaskNotFound({ id }) : Effect.void))
      )

    const complete = (id: TaskId) =>
      Effect.gen(function* () {
        const todayValue = yield* today
        const row = yield* findRowById(id).pipe(Effect.flatMap(orNotFound(id)))
        const dueDate = taskOccurrence(row.recurrence, row.completedThrough, todayValue).dueDate
        const updated = yield* setCompletedThrough({ id, completedThrough: dueDate }).pipe(Effect.flatMap(orNotFound(id)))
        return toView(updated, todayValue)
      })

    const uncomplete = (id: TaskId) =>
      Effect.gen(function* () {
        const todayValue = yield* today
        const updated = yield* setCompletedThrough({ id, completedThrough: null }).pipe(Effect.flatMap(orNotFound(id)))
        return toView(updated, todayValue)
      })

    return { findAll, create, update, remove, complete, uncomplete } as const
  }),
  dependencies: []
}) {}
