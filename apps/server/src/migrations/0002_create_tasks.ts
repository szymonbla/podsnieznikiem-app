import { SqlClient } from "@effect/sql"
import { Effect } from "effect"

export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient

  yield* sql`
    create table tasks (
      id                 uuid primary key default gen_random_uuid(),
      description        text  not null check (length(trim(description)) between 1 and 200),
      recurrence         jsonb not null,
      completed_through  text  check (completed_through ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
      created_at         timestamptz not null default now(),
      updated_at         timestamptz not null default now()
    )
  `

  yield* sql`create index tasks_created_at_idx on tasks (created_at)`
})
