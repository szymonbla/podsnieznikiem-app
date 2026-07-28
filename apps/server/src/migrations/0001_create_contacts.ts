import { SqlClient } from "@effect/sql"
import { Effect } from "effect"

export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient

  yield* sql`
    create table contacts (
      id         uuid primary key default gen_random_uuid(),
      name       text        not null check (length(trim(name)) between 1 and 100),
      role       text        not null check (length(trim(role)) between 1 and 60),
      phone      text        not null check (phone ~ '^[0-9]{9}$'),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `

  yield* sql`create index contacts_name_idx on contacts (name)`
})
