import { Migrator } from "@effect/sql"
import { PgMigrator } from "@effect/sql-pg"

import createContacts from "../migrations/0001_create_contacts.js"

/**
 * Migrations run at server start-up. The registry is explicit — the
 * `NNNN_name` key defines the order.
 */
export const migrations = {
  "0001_create_contacts": createContacts
}

export const MigratorLive = PgMigrator.layer({
  loader: Migrator.fromRecord(migrations)
})
