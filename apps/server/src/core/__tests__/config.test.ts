import { describe, expect, test } from "bun:test"
import { ConfigProvider, Effect, Exit, Redacted } from "effect"

import { appConfig } from "../config.js"

const load = (env: Record<string, string>) =>
  Effect.runSyncExit(
    appConfig.pipe(
      Effect.withConfigProvider(ConfigProvider.fromMap(new Map(Object.entries(env))))
    )
  )

describe("konfiguracja serwera", () => {
  test("brak adresu bazy zatrzymuje start z jasnym komunikatem", () => {
    const result = load({})

    expect(Exit.isFailure(result)).toBe(true)
    if (Exit.isFailure(result)) {
      expect(String(result.cause)).toContain("DATABASE_URL")
    }
  })

  test("odrzuca adres bazy, który nie jest adresem postgresa", () => {
    const result = load({ DATABASE_URL: "localhost:5433" })

    expect(Exit.isFailure(result)).toBe(true)
    if (Exit.isFailure(result)) {
      expect(String(result.cause)).toContain("postgres://")
    }
  })

  test("odrzuca port, który nie jest liczbą", () => {
    const result = load({ DATABASE_URL: "postgres://localhost/x", PORT: "trzy tysiące" })

    expect(Exit.isFailure(result)).toBe(true)
  })

  test("przyjmuje komplet zmiennych, port ma sensowną wartość domyślną", () => {
    const withPort = load({ DATABASE_URL: "postgres://localhost/x", PORT: "4000" })
    const withoutPort = load({ DATABASE_URL: "postgres://localhost/x" })

    expect(Exit.isSuccess(withPort)).toBe(true)
    if (Exit.isSuccess(withPort)) {
      expect(withPort.value.port).toBe(4000)
      expect(Redacted.value(withPort.value.databaseUrl)).toBe("postgres://localhost/x")
    }
    if (Exit.isSuccess(withoutPort)) {
      expect(withoutPort.value.port).toBe(3000)
    }
  })
})
