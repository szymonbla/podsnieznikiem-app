import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { Cause, Effect, Layer } from "effect"

import { appConfig } from "./config.js"
import { HttpLive } from "./layers.js"

const main = Effect.gen(function* () {
  const config = yield* appConfig

  yield* Layer.launch(
    Layer.provide(HttpLive, BunHttpServer.layer({ port: config.port }))
  )
}).pipe(
  Effect.catchTag("ConfigError", (error) =>
    Effect.logError(
      `Server did not start — invalid configuration. ${Cause.pretty(Cause.fail(error))}`
    ).pipe(Effect.zipRight(Effect.die(error)))
  )
)

BunRuntime.runMain(main)
