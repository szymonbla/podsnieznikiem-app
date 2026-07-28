import { BunRuntime } from "@effect/platform-bun"
import { Cause, Effect } from "effect"

import { ContactsRepository, seedContacts } from "../modules/contacts/index.js"
import { DatabaseLive } from "./layers.js"

/**
 * Komenda `db:seed` — osobne wejście, nie migracja. Migracje idą tą samą
 * warstwą co przy starcie serwera, więc świeżo postawiona baza wystarczy.
 */
const main = Effect.gen(function* () {
  const inserted = yield* seedContacts

  yield* Effect.log(
    inserted === 0
      ? "Dane przykładowe już są w bazie — nic nie dodano."
      : `Wgrano dane przykładowe: ${inserted} kontaktów.`
  )
}).pipe(
  Effect.provide(ContactsRepository.Default),
  Effect.provide(DatabaseLive),
  Effect.catchAllCause((cause) =>
    Effect.logError(`Nie udało się wgrać danych przykładowych. ${Cause.pretty(cause)}`).pipe(
      Effect.zipRight(Effect.sync(() => process.exit(1)))
    )
  )
)

BunRuntime.runMain(main)
