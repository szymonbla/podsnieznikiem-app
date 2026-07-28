import { Migrator } from "@effect/sql"
import { PgMigrator } from "@effect/sql-pg"

import createContacts from "../migrations/0001_create_contacts.js"

/**
 * Migracje uruchamiane na starcie serwera. Rejestr jest jawny — klucz
 * `NNNN_nazwa` wyznacza kolejność.
 */
export const migrations = {
  "0001_create_contacts": createContacts
}

export const MigratorLive = PgMigrator.layer({
  loader: Migrator.fromRecord(migrations)
})
