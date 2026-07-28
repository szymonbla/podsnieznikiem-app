/**
 * Kształt kontaktu żyje w paczce kontraktów — jest wspólny dla serwera
 * i (przez OpenAPI) klienta. Warstwa `domain` tylko go tu wprowadza,
 * żeby reszta modułu nie sięgała po paczkę bezpośrednio.
 */
export { Contact, ContactId, ContactName, ContactPhone, ContactRole } from "@podsnieznikiem/contracts"
