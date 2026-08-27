import { createOptimisticWrites } from "../../../libs/query/optimistic-writes"
import { CONTACTS_QUERY_KEY } from "../configuration/query-settings"
import { isContactField } from "../configuration/schema"
import type { Contact, ContactField, ContactWriteFailure } from "../domain/models"

const { MutationError: ContactMutationError, useOptimisticWrite } = createOptimisticWrites<
  Contact,
  ContactWriteFailure,
  ContactField
>({
  queryKey: CONTACTS_QUERY_KEY,
  notFoundTag: "ContactNotFound",
  fieldFromPath: (path) => (isContactField(path[0]) ? path[0] : undefined)
})

export { ContactMutationError, useOptimisticWrite }
