import { describe, expect, test } from "bun:test"
import { ConfigProvider, Effect, Exit, Redacted } from "effect"

import { appConfig } from "../config.js"

const load = (env: Record<string, string>) =>
  Effect.runSyncExit(
    appConfig.pipe(
      Effect.withConfigProvider(ConfigProvider.fromMap(new Map(Object.entries(env))))
    )
  )

describe("server configuration", () => {
  test("a missing database url stops start-up with a clear message", () => {
    const result = load({})

    expect(Exit.isFailure(result)).toBe(true)
    if (Exit.isFailure(result)) {
      expect(String(result.cause)).toContain("DATABASE_URL")
    }
  })

  test("rejects a database url that is not a postgres address", () => {
    const result = load({ DATABASE_URL: "localhost:5433" })

    expect(Exit.isFailure(result)).toBe(true)
    if (Exit.isFailure(result)) {
      expect(String(result.cause)).toContain("postgres://")
    }
  })

  test("rejects a port that is not a number", () => {
    const result = load({ DATABASE_URL: "postgres://localhost/x", PORT: "three thousand" })

    expect(Exit.isFailure(result)).toBe(true)
  })

  test("accepts a full set of variables; the port has a sensible default", () => {
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
