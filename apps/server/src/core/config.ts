import { Config, Redacted, Schema } from "effect"

const DatabaseUrl = Schema.String.pipe(
  Schema.pattern(/^postgres(ql)?:\/\/\S+$/, {
    message: () => "DATABASE_URL must be a postgres:// address"
  })
)

const Port = Schema.NumberFromString.pipe(Schema.int(), Schema.between(1, 65535))

/**
 * Configuration read from environment variables and validated by a schema.
 * This is the **only** place that touches the environment — layers take their
 * values from here, so that start-up validation is not decorative
 * (see `core/layers.ts`).
 */
export const appConfig = Config.all({
  databaseUrl: Schema.Config("DATABASE_URL", DatabaseUrl).pipe(Config.map(Redacted.make)),
  port: Schema.Config("PORT", Port).pipe(Config.withDefault(3000))
})

export type AppConfig = Config.Config.Success<typeof appConfig>
