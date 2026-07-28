import { FetchHttpClient, HttpApiClient, HttpServer } from "@effect/platform"
import { BunContext, BunHttpServer } from "@effect/platform-bun"
import { SqlClient } from "@effect/sql"
import { Effect, Layer } from "effect"

import { api } from "../core/api.js"
import { HttpLive } from "../core/layers.js"

const TestLive = Layer.mergeAll(BunContext.layer, FetchHttpClient.layer).pipe(
  Layer.merge(HttpLive),
  Layer.provideMerge(BunHttpServer.layer({ port: 0 }))
)

const makeClient = (baseUrl: string) => HttpApiClient.make(api, { baseUrl })

type ApiClient = Effect.Effect.Success<ReturnType<typeof makeClient>>

interface TestContext {
  readonly client: ApiClient
  readonly baseUrl: string
  readonly sql: SqlClient.SqlClient
}

/**
 * Seam 1 — the test hits a running server backed by a real Postgres. The
 * server comes up on a random port, migrations run exactly as they do on a
 * production start, and every test begins with an empty table.
 */
export const withServer = <A, E>(
  test: (context: TestContext) => Effect.Effect<A, E, never>
) =>
  Effect.gen(function* () {
    const server = yield* HttpServer.HttpServer
    const address = server.address
    if (address._tag !== "TcpAddress") {
      return yield* Effect.dieMessage("Test server has no TCP address")
    }

    const baseUrl = `http://localhost:${address.port}`
    const client = yield* makeClient(baseUrl)
    const sql = yield* SqlClient.SqlClient

    yield* sql`truncate table contacts`

    return yield* test({ client, baseUrl, sql })
  }).pipe(Effect.provide(TestLive), Effect.scoped, Effect.runPromise)
