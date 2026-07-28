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
 * Szew 1 — test uderza w działający serwer z prawdziwym Postgresem.
 * Serwer wstaje na losowym porcie, migracje idą tak samo jak przy starcie
 * produkcyjnym, a każdy test zaczyna od pustej tabeli.
 */
export const withServer = <A, E>(
  test: (context: TestContext) => Effect.Effect<A, E, never>
) =>
  Effect.gen(function* () {
    const server = yield* HttpServer.HttpServer
    const address = server.address
    if (address._tag !== "TcpAddress") {
      return yield* Effect.dieMessage("Serwer testowy nie ma adresu TCP")
    }

    const baseUrl = `http://localhost:${address.port}`
    const client = yield* makeClient(baseUrl)
    const sql = yield* SqlClient.SqlClient

    yield* sql`truncate table contacts`

    return yield* test({ client, baseUrl, sql })
  }).pipe(Effect.provide(TestLive), Effect.scoped, Effect.runPromise)
