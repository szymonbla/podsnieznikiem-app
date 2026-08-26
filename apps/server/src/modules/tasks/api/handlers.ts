import { HttpApi, HttpApiBuilder } from "@effect/platform"
import { Effect, Layer } from "effect"

import { API_ID } from "../../../core/api-id.js"
import { TaskNotFound } from "../domain/errors.js"
import { TasksRepository } from "../integration/repository.js"
import { tasksGroup } from "./endpoints.js"

/**
 * A handle used only to type the handlers: `HttpApiBuilder.group` derives the
 * layer tag from the pair (API identifier, group name). This object is never
 * served — `core/api.ts` is. That way the module never imports the composition
 * from `core`, no cycle appears, and adding another group to the API needs no
 * change here.
 */
const tasksApi = HttpApi.make(API_ID).add(tasksGroup)

/**
 * Failure details stay in the server log — only the status goes out
 * (DESIGN.md §8). Logging itself decides nothing; what counts as a response
 * and what as a 500 is settled by `Effect.orDie` and `onlyNotFound`.
 */
const logFailure = <A, E, R>(effect: Effect.Effect<A, E, R>) => effect.pipe(Effect.tapErrorCause(Effect.logError))

/**
 * A missing task is a response (404), not a failure — everything else falls
 * through to a 500. The split has to be explicit: a bare `orDie` would swallow
 * the domain error too, the one the endpoint promises in its signature.
 */
const onlyNotFound = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(Effect.catchAll((error) => (error instanceof TaskNotFound ? Effect.fail(error) : Effect.die(error))))

export const TasksApiLive = HttpApiBuilder.group(tasksApi, "tasks", (handlers) =>
  handlers
    .handle("list", () => Effect.flatMap(TasksRepository, (r) => r.findAll()).pipe(logFailure, Effect.orDie))
    .handle("create", ({ payload }) => Effect.flatMap(TasksRepository, (r) => r.create(payload)).pipe(logFailure, Effect.orDie))
    .handle("update", ({ path, payload }) => Effect.flatMap(TasksRepository, (r) => r.update(path.id, payload)).pipe(logFailure, onlyNotFound))
    .handle("remove", ({ path }) => Effect.flatMap(TasksRepository, (r) => r.remove(path.id)).pipe(logFailure, onlyNotFound))
    .handle("complete", ({ path }) => Effect.flatMap(TasksRepository, (r) => r.complete(path.id)).pipe(logFailure, onlyNotFound))
    .handle("uncomplete", ({ path }) => Effect.flatMap(TasksRepository, (r) => r.uncomplete(path.id)).pipe(logFailure, onlyNotFound))
).pipe(Layer.provide(TasksRepository.Default))
