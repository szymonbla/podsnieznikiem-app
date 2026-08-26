import { Migrator } from "@effect/sql"
import { PgMigrator } from "@effect/sql-pg"

import createContacts from "../migrations/0001_create_contacts.js"
import createTasks from "../migrations/0002_create_tasks.js"

/**
 * Migrations run at server start-up. The registry is explicit — the
 * `NNNN_name` key defines the order.
 */
export const migrations = {
  "0001_create_contacts": createContacts,
  "0002_create_tasks": createTasks
}

export const MigratorLive = PgMigrator.layer({
  loader: Migrator.fromRecord(migrations)
})
