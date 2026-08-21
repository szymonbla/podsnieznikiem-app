import {
  HttpApiBuilder,
  HttpApiSwagger,
  HttpServer,
  HttpServerResponse,
  OpenApi
} from "@effect/platform"
import { BunContext } from "@effect/platform-bun"
import { PgClient } from "@effect/sql-pg"
import { Effect, Layer } from "effect"

import { ContactsApiLive } from "../modules/contacts/index.js"
import { api } from "./api.js"
import { appConfig } from "./config.js"
import { MigratorLive } from "./migrator.js"

/**
 * The Postgres connection, built from the **validated** configuration — not
 * from a separate read of the environment variable. An invalid `DATABASE_URL`
 * aborts start-up.
 */
export const SqlLive = Layer.unwrapEffect(
  Effect.map(appConfig, (config) => PgClient.layer({ url: config.databaseUrl }))
)

/** Migrations run at start-up, before the first request is served. */
export const DatabaseLive = Layer.provideMerge(
  MigratorLive.pipe(Layer.provide(BunContext.layer)),
  SqlLive
)

const ApiLive = HttpApiBuilder.api(api).pipe(Layer.provide(ContactsApiLive))

/**
 * The origins the browser may call this API from, taken from the validated
 * configuration.
 *
 * The check is a **predicate, not the list itself**. Handed a list, the
 * middleware treats an empty one as "allow every origin" and answers `*` — so a
 * deployment that forgot `ALLOWED_ORIGINS` would be open to every site on the
 * internet, which is the opposite of what forgetting should cost. A predicate
 * refuses whatever it was not told to allow.
 */
const CorsLive = Layer.unwrapEffect(
  Effect.map(appConfig, (config) =>
    HttpApiBuilder.middlewareCors({
      allowedOrigins: (origin) => config.allowedOrigins.includes(origin),
      // Cookies are not used yet. The setting is here so that adding log-in
      // does not turn into a hunt for why the session is dropped.
      credentials: true
    })
  )
)

/**
 * The raw OpenAPI document alongside Swagger UI — the source for the client
 * type generator (DESIGN.md §5; the generator itself ships with the client).
 */
const OpenApiJsonLive = HttpApiBuilder.Router.use((router) =>
  router.get(
    "/docs/openapi.json",
    Effect.succeed(HttpServerResponse.unsafeJson(OpenApi.fromApi(api)))
  )
)

/**
 * The complete HTTP application without the server layer — see `server.ts`.
 * `SqlClient` is re-exported so seam 1 tests can look into the database.
 */
export const HttpLive = HttpApiBuilder.serve().pipe(
  Layer.provide(CorsLive),
  Layer.provide(HttpApiSwagger.layer({ path: "/docs" })),
  Layer.provide(OpenApiJsonLive),
  Layer.provide(ApiLive),
  HttpServer.withLogAddress,
  Layer.provideMerge(DatabaseLive)
)
