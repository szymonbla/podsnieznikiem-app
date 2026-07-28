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
 * Połączenie z Postgresem, zbudowane z **zwalidowanej** konfiguracji —
 * nie z osobnego odczytu zmiennej. Nieprawidłowy `DATABASE_URL` przerywa start.
 */
export const SqlLive = Layer.unwrapEffect(
  Effect.map(appConfig, (config) => PgClient.layer({ url: config.databaseUrl }))
)

/** Migracje idą na starcie, przed obsługą pierwszego żądania. */
export const DatabaseLive = Layer.provideMerge(
  MigratorLive.pipe(Layer.provide(BunContext.layer)),
  SqlLive
)

const ApiLive = HttpApiBuilder.api(api).pipe(Layer.provide(ContactsApiLive))

/**
 * Surowy dokument OpenAPI obok Swagger UI — źródło dla generatora typów
 * klienta (DESIGN.md §5; sam generator dochodzi razem z klientem).
 */
const OpenApiJsonLive = HttpApiBuilder.Router.use((router) =>
  router.get(
    "/docs/openapi.json",
    Effect.succeed(HttpServerResponse.unsafeJson(OpenApi.fromApi(api)))
  )
)

/**
 * Kompletna aplikacja HTTP bez warstwy serwera — patrz `server.ts`.
 * `SqlClient` wychodzi na zewnątrz, żeby testy szwu 1 mogły zaglądać do bazy.
 */
export const HttpLive = HttpApiBuilder.serve().pipe(
  Layer.provide(HttpApiSwagger.layer({ path: "/docs" })),
  Layer.provide(OpenApiJsonLive),
  Layer.provide(ApiLive),
  HttpServer.withLogAddress,
  Layer.provideMerge(DatabaseLive)
)
