import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform"
import { Schema } from "effect"

import { ContactNotFound } from "../domain/errors.js"
import { Contact, ContactId, CreateContactBody, UpdateContactBody } from "../domain/models.js"

/** Path parameter for operations on a single contact. */
const idParam = Schema.Struct({ id: ContactId })

/**
 * `GET /contacts` returns the whole set — no parameters. Filtering and sorting
 * belong to the client (see DESIGN.md §7).
 */
export const contactsGroup = HttpApiGroup.make("contacts")
  .add(
    HttpApiEndpoint.get("list", "/contacts")
      .addSuccess(Schema.Array(Contact))
      .annotate(OpenApi.Description, "Returns every contact, ordered by name")
  )
  .add(
    HttpApiEndpoint.post("create", "/contacts")
      .setPayload(CreateContactBody)
      .addSuccess(Contact, { status: 201 })
      .annotate(OpenApi.Description, "Creates a contact; requires all three fields")
  )
  .add(
    /*
     * The update is partial: an omitted field stays unchanged. `PATCH`, not
     * `PUT`, because the client sends what the owner actually changed.
     */
    HttpApiEndpoint.patch("update", "/contacts/:id")
      .setPath(idParam)
      .setPayload(UpdateContactBody)
      .addSuccess(Contact)
      .addError(ContactNotFound, { status: 404 })
      .annotate(OpenApi.Description, "Updates the given fields of a contact")
  )
  .add(
    /*
     * Deletion is permanent — no `deleted_at`, no deferral (ADR-0003). The
     * client's "undo" is a re-create.
     */
    HttpApiEndpoint.del("remove", "/contacts/:id")
      .setPath(idParam)
      .addError(ContactNotFound, { status: 404 })
      .annotate(OpenApi.Description, "Deletes a contact permanently")
  )
  .annotate(OpenApi.Title, "Contacts")
