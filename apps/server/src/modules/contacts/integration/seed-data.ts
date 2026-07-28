import type { Contact } from "../domain/models.js"

/**
 * A contact without identity or timestamps — exactly what can be written to
 * the database. The shape comes from the contract, so a new `Contact` field
 * breaks compilation here instead of quietly dropping out of the set.
 */
export type SampleContact = Pick<Contact, "name" | "role" | "phone">

/**
 * The sample set — the tradespeople the cottage owner calls. Phone numbers are
 * digits only, just like in the database (DESIGN.md §6). The names and roles
 * stay Polish: they are domain data, not code.
 *
 * Grzegorz Sobczak appears **twice** under one number, with two specialities.
 * That is not a mistake in the data but the case behind the duplicate-number
 * warning (CONTEXT.md -> Telefon).
 */
export const sampleContacts: ReadonlyArray<SampleContact> = [
  { name: "Grzegorz Sobczak", role: "Złota rączka", phone: "602118447" },
  { name: "Grzegorz Sobczak", role: "Odśnieżanie", phone: "602118447" },
  { name: "Anna Kowalczyk", role: "Sprzątanie", phone: "512340981" },
  { name: "Marek Wójcik", role: "Hydraulik", phone: "601234567" },
  { name: "Łukasz Ćwikła", role: "Elektryk", phone: "605887210" },
  { name: "Halina Szczęsna", role: "Księgowa", phone: "693114508" },
  { name: "Zbigniew Mróz", role: "Kominiarz", phone: "608432119" },
  { name: "Jadwiga Wiśniewska", role: "Pranie pościeli", phone: "515760342" },
  { name: "Tadeusz Duda", role: "Serwis pieca", phone: "604229873" },
  { name: "Krzysztof Żurek", role: "Dekarz", phone: "691503774" },
  { name: "Bożena Lis", role: "Zaopatrzenie", phone: "512908631" },
  { name: "Adam Piątek", role: "Stolarz", phone: "607341226" },
  { name: "Elżbieta Świderska", role: "Ogród", phone: "698220145" },
  { name: "Ryszard Głowacki", role: "Odśnieżanie dojazdu", phone: "603776901" },
  { name: "Michał Sikora", role: "Internet i telewizja", phone: "882410559" },
  { name: "Katarzyna Zając", role: "Wynajem sprzętu", phone: "506318472" },
  { name: "Paweł Rutkowski", role: "Szambo i asenizacja", phone: "662854103" },
  { name: "Sławomir Bąk", role: "Wywóz śmieci", phone: "601988240" },
  { name: "Iwona Kaczmarek", role: "Recepcja zastępcza", phone: "534027819" },
  { name: "Janusz Szymański", role: "Alarm i monitoring", phone: "600713365" },
  { name: "Wiesława Nowicka", role: "Piekarnia", phone: "509442178" },
  { name: "Dariusz Kołodziej", role: "Transport drewna", phone: "697601233" },
  { name: "Agnieszka Wróbel", role: "Instruktor narciarski", phone: "781305664" },
  { name: "Mariusz Jabłoński", role: "Serwis AGD", phone: "604150927" }
]
