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
  Layer.provide(HttpApiSwagger.layer({ path: "/docs" })),
  Layer.provide(OpenApiJsonLive),
  Layer.provide(ApiLive),
  HttpServer.withLogAddress,
  Layer.provideMerge(DatabaseLive)
)
