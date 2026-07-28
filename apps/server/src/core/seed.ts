import { BunRuntime } from "@effect/platform-bun"
import { Cause, Effect } from "effect"

import { ContactsRepository, seedContacts } from "../modules/contacts/index.js"
import { DatabaseLive } from "./layers.js"

/**
 * The `db:seed` command — a separate entry point, not a migration. Migrations
 * run through the same layer as at server start-up, so a freshly created
 * database is enough.
 */
const main = Effect.gen(function* () {
  const inserted = yield* seedContacts

  yield* Effect.log(
    inserted === 0
      ? "Sample data is already in the database — nothing inserted."
      : `Sample data loaded: ${inserted} contacts.`
  )
}).pipe(
  Effect.provide(ContactsRepository.Default),
  Effect.provide(DatabaseLive),
  Effect.catchAllCause((cause) =>
    Effect.logError(`Failed to load sample data. ${Cause.pretty(cause)}`).pipe(
      Effect.zipRight(Effect.sync(() => process.exit(1)))
    )
  )
)

BunRuntime.runMain(main)
