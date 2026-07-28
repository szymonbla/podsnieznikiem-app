import { HttpApi, HttpApiBuilder } from "@effect/platform"
import { Effect, Layer } from "effect"

import { API_ID } from "../../../core/api-id.js"
import { ContactNotFound } from "../domain/errors.js"
import { ContactsRepository } from "../integration/repository.js"
import { contactsGroup } from "./endpoints.js"

/**
 * Uchwyt tylko do typowania handlerów: `HttpApiBuilder.group` wyprowadza tag
 * warstwy z pary (identyfikator API, nazwa grupy). Ten obiekt nigdy nie jest
 * serwowany — serwowane jest `core/api.ts`. Dzięki temu moduł nie importuje
 * kompozycji z `core` i nie powstaje cykl; dodanie kolejnej grupy do API
 * nie wymaga zmian w tym pliku.
 */
const contactsApi = HttpApi.make(API_ID).add(contactsGroup)

/**
 * Szczegóły awarii zostają w logu serwera — na zewnątrz idzie sam status
 * (DESIGN.md §8). Samo logowanie niczego nie rozstrzyga; o tym, co jest
 * odpowiedzią, a co pięćsetką, decydują `Effect.orDie` i `onlyNotFound`.
 */
const logFailure = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(Effect.tapErrorCause(Effect.logError))

/**
 * Nieodnaleziony kontakt jest odpowiedzią (404), nie awarią — wszystko inne
 * schodzi do 500. Rozdzielenie musi być jawne: samo `orDie` zabrałoby też błąd
 * domenowy, który endpoint obiecuje w sygnaturze.
 */
const onlyNotFound = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.catchAll((error) =>
      error instanceof ContactNotFound ? Effect.fail(error) : Effect.die(error)
    )
  )

export const ContactsApiLive = HttpApiBuilder.group(contactsApi, "contacts", (handlers) =>
  handlers
    .handle("list", () =>
      Effect.flatMap(ContactsRepository, (repository) => repository.findAll()).pipe(
        logFailure,
        Effect.orDie
      )
    )
    .handle("create", ({ payload }) =>
      Effect.flatMap(ContactsRepository, (repository) => repository.create(payload)).pipe(
        logFailure,
        Effect.orDie
      )
    )
    .handle("update", ({ path, payload }) =>
      Effect.flatMap(ContactsRepository, (repository) =>
        repository.update(path.id, payload)
      ).pipe(logFailure, onlyNotFound)
    )
    .handle("remove", ({ path }) =>
      Effect.flatMap(ContactsRepository, (repository) => repository.remove(path.id)).pipe(
        logFailure,
        onlyNotFound
      )
    )
).pipe(Layer.provide(ContactsRepository.Default))
