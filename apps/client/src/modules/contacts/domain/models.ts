import type { operations } from "../../../generated/api"

/**
 * Kształt kontaktu pochodzi z wygenerowanego kontraktu, nie z ręcznego
 * przepisania — zmiana pola na serwerze psuje kompilację tutaj. To jedyne
 * miejsce w module, które sięga do `generated/`.
 */
export type Contact =
  operations["contacts.list"]["responses"][200]["content"]["application/json"][number]

/** Ciało `POST /contacts` — komplet trzech pól. */
export type CreateContactBody =
  operations["contacts.create"]["requestBody"]["content"]["application/json"]

/** Ciało `PATCH /contacts/:id` — tylko to, co właściciel faktycznie zmienił. */
export type UpdateContactBody =
  operations["contacts.update"]["requestBody"]["content"]["application/json"]

/**
 * Nieodnaleziony kontakt przychodzi z serwera jako otagowana odpowiedź, nie jako
 * goły status. Rozpoznajemy go po tagu, bo to on przetrwa dołożenie kolejnego
 * błędu domenowego (DESIGN.md §8).
 */
export type ContactNotFound =
  operations["contacts.update"]["responses"][404]["content"]["application/json"]

/** Odpowiedź 400 — błąd walidacji schematu, ze ścieżką do pola. */
export type ContactValidationFailure =
  operations["contacts.update"]["responses"][400]["content"]["application/json"]

/**
 * Wszystko, czym zapis może się nie udać po stronie API. Unia pochodzi
 * z kontraktu, więc nowy błąd domenowy na serwerze psuje kompilację obsługi —
 * i to jest tu celem (DESIGN.md §8).
 */
export type ContactWriteFailure = ContactNotFound | ContactValidationFailure

/** Pola, które właściciel wypełnia — te same w formularzu i w ciele żądania. */
export type ContactField = keyof CreateContactBody
