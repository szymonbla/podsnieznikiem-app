import { Config, Redacted, Schema } from "effect"

const DatabaseUrl = Schema.String.pipe(
  Schema.pattern(/^postgres(ql)?:\/\/\S+$/, {
    message: () => "DATABASE_URL must be a postgres:// address"
  })
)

const Port = Schema.NumberFromString.pipe(Schema.int(), Schema.between(1, 65535))

/**
 * Origins the browser may call this API from, comma separated. Empty by
 * default, and empty means **none** (see `core/layers.ts`): in dev the Vite
 * proxy makes every request same-origin, so no origin needs allowing.
 *
 * In production the client is served by Cloudflare Pages from a different host,
 * and that host has to be named here. A missing or misspelt entry fails in one
 * direction only — the app goes blank while `curl` keeps working.
 *
 * Write the bare origin: `https://app.podsnieznikiem.pl`, no trailing slash,
 * no path.
 */
const allowedOrigins = Config.array(Config.string(), "ALLOWED_ORIGINS").pipe(
  Config.withDefault<ReadonlyArray<string>>([])
)

/**
 * Configuration read from environment variables and validated by a schema.
 * This is the **only** place that touches the environment — layers take their
 * values from here, so that start-up validation is not decorative
 * (see `core/layers.ts`).
 */
export const appConfig = Config.all({
  databaseUrl: Schema.Config("DATABASE_URL", DatabaseUrl).pipe(Config.map(Redacted.make)),
  port: Schema.Config("PORT", Port).pipe(Config.withDefault(3000)),
  allowedOrigins
})

export type AppConfig = Config.Config.Success<typeof appConfig>
