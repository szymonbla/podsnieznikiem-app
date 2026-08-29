import { HttpApi, OpenApi } from "@effect/platform"

import { contactsGroup } from "../modules/contacts/index.js"
import { tasksGroup } from "../modules/tasks/index.js"
import { API_ID } from "./api-id.js"

export const api = HttpApi.make(API_ID)
  .add(contactsGroup)
  .add(tasksGroup)
  .annotate(OpenApi.Title, "Pod \u015anie\u017cnikiem")
  .annotate(OpenApi.Description, "API for the cottage owner panel")
