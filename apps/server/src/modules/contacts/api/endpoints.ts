import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform"
import { Schema } from "effect"

import { Contact } from "../domain/models.js"

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
  .annotate(OpenApi.Title, "Kontakty")
