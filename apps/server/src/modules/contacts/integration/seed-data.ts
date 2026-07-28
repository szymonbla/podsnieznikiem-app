import type { Contact } from "../domain/models.js"

/**
 * Kontakt bez tożsamości i znaczników czasu — dokładnie to, co da się wpisać
 * do bazy. Kształt pochodzi z kontraktu, więc nowe pole `Contact` psuje
 * kompilację tutaj, zamiast po cichu wypaść z zestawu.
 */
export type SampleContact = Pick<Contact, "name" | "role" | "phone">

/**
 * Zestaw przykładowy — fachowcy, do których dzwoni właściciel domku.
 * Numery to same cyfry, tak jak w bazie (DESIGN.md §6).
 *
 * Grzegorz Sobczak występuje **dwa razy** pod jednym numerem, z dwiema
 * specjalizacjami. To nie pomyłka w danych, tylko przypadek pod ostrzeżenie
 * o powtórzonym numerze (CONTEXT.md → Telefon).
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
