import { Schema } from "effect"

import { ContactId } from "./models.js"

/**
 * Jedyny błąd domenowy MVP. Zadeklarowany per-endpoint w `HttpApi`, więc Effect
 * wymusza jego obsługę w sygnaturze handlera, mapuje na 404 i wpisuje do
 * OpenAPI — dzięki czemu dociera na klienta jako typowana unia (DESIGN.md §8).
 */
export class ContactNotFound extends Schema.TaggedError<ContactNotFound>()("ContactNotFound", {
  id: ContactId
}) {}
