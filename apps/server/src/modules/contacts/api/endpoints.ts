import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform"
import { Schema } from "effect"

import { ContactNotFound } from "../domain/errors.js"
import { Contact, ContactId, CreateContactBody, UpdateContactBody } from "../domain/models.js"

/** Parametr ścieżki dla operacji na pojedynczym kontakcie. */
const idParam = Schema.Struct({ id: ContactId })

/**
 * `GET /contacts` zwraca komplet — bez parametrów. Filtrowanie i sortowanie
 * należą do klienta (patrz DESIGN.md §7).
 */
export const contactsGroup = HttpApiGroup.make("contacts")
  .add(
    HttpApiEndpoint.get("list", "/contacts")
      .addSuccess(Schema.Array(Contact))
      .annotate(OpenApi.Description, "Zwraca wszystkie kontakty, uporządkowane po nazwie")
  )
  .add(
    HttpApiEndpoint.post("create", "/contacts")
      .setPayload(CreateContactBody)
      .addSuccess(Contact, { status: 201 })
      .annotate(OpenApi.Description, "Tworzy kontakt; wymaga kompletu trzech pól")
  )
  .add(
    /*
     * Aktualizacja jest częściowa: pominięte pole zostaje bez zmian. `PATCH`,
     * nie `PUT`, bo klient wysyła to, co właściciel faktycznie zmienił.
     */
    HttpApiEndpoint.patch("update", "/contacts/:id")
      .setPath(idParam)
      .setPayload(UpdateContactBody)
      .addSuccess(Contact)
      .addError(ContactNotFound, { status: 404 })
      .annotate(OpenApi.Description, "Aktualizuje wskazane pola kontaktu")
  )
  .add(
    /*
     * Usunięcie jest trwałe — bez `deleted_at` i bez odroczenia
     * (ADR-0003). „Cofnij" po stronie klienta to ponowne utworzenie.
     */
    HttpApiEndpoint.del("remove", "/contacts/:id")
      .setPath(idParam)
      .addError(ContactNotFound, { status: 404 })
      .annotate(OpenApi.Description, "Usuwa kontakt trwale")
  )
  .annotate(OpenApi.Title, "Kontakty")
