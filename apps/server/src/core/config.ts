import { Config, Redacted, Schema } from "effect"

const DatabaseUrl = Schema.String.pipe(
  Schema.pattern(/^postgres(ql)?:\/\/\S+$/, {
    message: () => "DATABASE_URL musi być adresem postgres://"
  })
)

const Port = Schema.NumberFromString.pipe(Schema.int(), Schema.between(1, 65535))

/**
 * Konfiguracja czytana ze zmiennych środowiskowych i walidowana schematem.
 * To **jedyne** miejsce, które sięga po zmienne — warstwy biorą wartości stąd,
 * żeby walidacja na starcie nie była dekoracją (patrz `core/layers.ts`).
 */
export const appConfig = Config.all({
  databaseUrl: Schema.Config("DATABASE_URL", DatabaseUrl).pipe(Config.map(Redacted.make)),
  port: Schema.Config("PORT", Port).pipe(Config.withDefault(3000))
})

export type AppConfig = Config.Config.Success<typeof appConfig>
