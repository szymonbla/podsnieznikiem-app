import { describe, expect, test } from "bun:test"

import { aContact } from "../../../__tests__/harness"
import { compareContacts } from "../domain/sorting"

/** Zwraca same nazwiska — asercja na kolejności czyta się wtedy jak lista. */
const sortedNames = (
  contacts: ReadonlyArray<ReturnType<typeof aContact>>,
  ...args: Parameters<typeof compareContacts>
) =>
  [...contacts]
    .sort(compareContacts(...args))
    .map((contact) => contact.name)

describe("porównanie kontaktów do sortowania", () => {
  test("układa polskie znaki tam, gdzie stoją w alfabecie: Ł po L, nie na końcu", () => {
    const contacts = [
      aContact({ name: "Marek Nowak" }),
      aContact({ name: "Łukasz Mazur" }),
      aContact({ name: "Lidia Zając" }),
      aContact({ name: "Óscar Ramos" }),
      aContact({ name: "Piotr Żak" })
    ]

    expect(sortedNames(contacts, "name", "asc")).toEqual([
      "Lidia Zając",
      "Łukasz Mazur",
      "Marek Nowak",
      "Óscar Ramos",
      "Piotr Żak"
    ])
  })

  test("odwrócony kierunek daje dokładnie odwrotną kolejność", () => {
    const contacts = [
      aContact({ name: "Anna Kowalska" }),
      aContact({ name: "Łukasz Mazur" }),
      aContact({ name: "Marek Nowak" })
    ]

    expect(sortedNames(contacts, "name", "desc")).toEqual([
      "Marek Nowak",
      "Łukasz Mazur",
      "Anna Kowalska"
    ])
  })

  test("przy tej samej specjalizacji rozstrzyga nazwisko, więc kolejność nie skacze", () => {
    const contacts = [
      aContact({ name: "Marek Nowak", role: "Hydraulik" }),
      aContact({ name: "Anna Kowalska", role: "Hydraulik" }),
      aContact({ name: "Ewa Lis", role: "Elektryk" })
    ]

    expect(sortedNames(contacts, "role", "asc")).toEqual([
      "Ewa Lis",
      "Anna Kowalska",
      "Marek Nowak"
    ])
  })

  test("remis rozstrzyga nazwisko rosnąco także przy malejącym sortowaniu głównym", () => {
    const contacts = [
      aContact({ name: "Marek Nowak", role: "Hydraulik" }),
      aContact({ name: "Anna Kowalska", role: "Hydraulik" }),
      aContact({ name: "Ewa Lis", role: "Elektryk" })
    ]

    expect(sortedNames(contacts, "role", "desc")).toEqual([
      "Anna Kowalska",
      "Marek Nowak",
      "Ewa Lis"
    ])
  })

  test("numery porównuje po wartości, więc wiersze o podobnych numerach lądują obok siebie", () => {
    const contacts = [
      aContact({ name: "Marek Nowak", phone: "602118447" }),
      aContact({ name: "Anna Kowalska", phone: "512345678" }),
      aContact({ name: "Ewa Lis", phone: "602118446" })
    ]

    expect(sortedNames(contacts, "phone", "asc")).toEqual([
      "Anna Kowalska",
      "Ewa Lis",
      "Marek Nowak"
    ])
  })
})
