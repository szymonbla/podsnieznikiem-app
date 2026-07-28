import { HttpApi, HttpApiBuilder } from "@effect/platform"
import { Effect, Layer } from "effect"

import { API_ID } from "../../../core/api-id.js"
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

export const ContactsApiLive = HttpApiBuilder.group(contactsApi, "contacts", (handlers) =>
  handlers.handle("list", () =>
    Effect.flatMap(ContactsRepository, (repository) => repository.findAll()).pipe(
      // Awaria bazy albo wiersz nie do zdekodowania to błąd serwera: 500,
      // szczegóły wyłącznie w logu (DESIGN.md §8).
      Effect.tapErrorCause(Effect.logError),
      Effect.orDie
    )
  )
).pipe(Layer.provide(ContactsRepository.Default))
