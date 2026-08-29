import { FetchHttpClient, HttpApiClient, HttpClient, HttpServer } from "@effect/platform"
import { BunContext, BunHttpServer } from "@effect/platform-bun"
import { SqlClient } from "@effect/sql"
import { Effect, Layer, TestContext } from "effect"

import { api } from "../core/api.js"
import { HttpLive } from "../core/layers.js"

const BaseTestLive = Layer.mergeAll(BunContext.layer, FetchHttpClient.layer).pipe(
  Layer.merge(HttpLive),
  Layer.provideMerge(BunHttpServer.layer({ port: 0 }))
)

/**
 * The live clock, for every module's tests. `TestContext.TestContext` is
 * deliberately NOT provided here: it swaps every default service (Clock
 * included) for a frozen-at-epoch-0 fake, and that must stay scoped to the
 * tests that actually drive a `TestClock` — see `withClockControlledServer`.
 */
const TestLive = BaseTestLive

/**
 * Same server, but with `TestContext.TestContext` provided as the outermost
 * `Layer.provideMerge` — so it builds (and its `Clock` override takes effect)
 * before `HttpLive`/`BunHttpServer` capture their request-handling runtime,
 * and every fiber that server forks to handle a request inherits it. Use
 * this only from tests that call `TestClock.setTime(...)`.
 */
const TestClockLive = BaseTestLive.pipe(Layer.provideMerge(TestContext.TestContext))

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
 *
 * The truncate below is why `preload.ts` redirects the suite onto a database
 * of its own: pointed at the working database it would empty it on every run.
 */
const runOn = <LE>(layer: Layer.Layer<HttpServer.HttpServer | SqlClient.SqlClient | HttpClient.HttpClient, LE, never>) =>
  <A, E>(test: (context: TestContext) => Effect.Effect<A, E, never>) =>
    Effect.gen(function* () {
      const server = yield* HttpServer.HttpServer
      const address = server.address
      if (address._tag !== "TcpAddress") {
        return yield* Effect.dieMessage("Test server has no TCP address")
      }

      const baseUrl = `http://localhost:${address.port}`
      const client = yield* makeClient(baseUrl)
      const sql = yield* SqlClient.SqlClient

      yield* sql`truncate table contacts, tasks`

      return yield* test({ client, baseUrl, sql })
    }).pipe(Effect.provide(layer), Effect.scoped, Effect.runPromise)

export const withServer = runOn(TestLive)

/** Same as `withServer`, but for tests that call `TestClock.setTime(...)`. */
export const withClockControlledServer = runOn(TestClockLive)
