import { Schema } from "effect"

export const ContactId = Schema.UUID.pipe(Schema.brand("ContactId"))
export type ContactId = typeof ContactId.Type

export const ContactName = Schema.String.pipe(
  Schema.trimmed(),
  Schema.minLength(1),
  Schema.maxLength(100)
)

export const ContactRole = Schema.String.pipe(
  Schema.trimmed(),
  Schema.minLength(1),
  Schema.maxLength(60)
)

export const ContactPhone = Schema.String.pipe(Schema.pattern(/^\d{9}$/))

export const Contact = Schema.Struct({
  id: ContactId,
  name: ContactName,
  role: ContactRole,
  phone: ContactPhone,
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc
})
export type Contact = typeof Contact.Type

/**
 * Tworzenie wymaga kompletu trzech pól — `POST` bez specjalizacji to 400
 * (DESIGN.md §7).
 *
 * Ograniczenia liczą się **po przycięciu** (spec 0001 → API), więc pola wejścia
 * przycinają, a nie odrzucają: `"  Marek  "` to poprawne nazwisko, nie błąd.
 * Dlatego kształt nie jest wyprowadzony z `Contact` — tam te same reguły stoją
 * jako warunek na wartości już przyciętej, którą zwraca baza.
 */
export const CreateContactBody = Schema.Struct({
  name: Schema.Trim.pipe(Schema.minLength(1), Schema.maxLength(100)),
  role: Schema.Trim.pipe(Schema.minLength(1), Schema.maxLength(60)),
  phone: ContactPhone
})
export type CreateContactBody = typeof CreateContactBody.Type

/**
 * Edycja jest częściowa — pominięte pole zostaje bez zmian. Pola nie mogą być
 * puste, więc raz ustawionej specjalizacji nie da się wyczyścić, tylko
 * nadpisać. Świadome uproszczenie MVP (spec 0001 → API).
 */
export const UpdateContactBody = Schema.partial(CreateContactBody)
export type UpdateContactBody = typeof UpdateContactBody.Type
