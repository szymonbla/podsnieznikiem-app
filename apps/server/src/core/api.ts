import { HttpApi, OpenApi } from "@effect/platform"

import { contactsGroup } from "../modules/contacts/index.js"
import { API_ID } from "./api-id.js"

export const api = HttpApi.make(API_ID)
  .add(contactsGroup)
  .annotate(OpenApi.Title, "Pod Śnieżnikiem")
  .annotate(OpenApi.Description, "API panelu właściciela domku")
