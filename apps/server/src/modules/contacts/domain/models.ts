/**
 * The contact shape lives in the contracts package — shared by the server and
 * (through OpenAPI) the client. The `domain` layer only re-exports it here so
 * the rest of the module never reaches for the package directly.
 */
export {
  Contact,
  ContactId,
  ContactName,
  ContactPhone,
  ContactRole,
  CreateContactBody,
  UpdateContactBody
} from "@podsnieznikiem/contracts"
