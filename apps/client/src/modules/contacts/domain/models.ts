import type { operations } from "../../../generated/api"

/**
 * Kształt kontaktu pochodzi z wygenerowanego kontraktu, nie z ręcznego
 * przepisania — zmiana pola na serwerze psuje kompilację tutaj. To jedyne
 * miejsce w module, które sięga do `generated/`.
 */
export type Contact =
  operations["contacts.list"]["responses"][200]["content"]["application/json"][number]
