import { describe, expect, test } from "bun:test"

import { aContact } from "../../../__tests__/contact-builder"
import { compareContacts } from "../domain/sorting"

/** Returns the names alone — an assertion on order then reads like a list. */
const sortedNames = (
  contacts: ReadonlyArray<ReturnType<typeof aContact>>,
  ...args: Parameters<typeof compareContacts>
) =>
  [...contacts]
    .sort(compareContacts(...args))
    .map((contact) => contact.name)

describe("contact comparison for sorting", () => {
  test("puts Polish characters where the alphabet puts them: Ł after L, not at the end", () => {
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

  test("a reversed direction gives exactly the reverse order", () => {
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

  test("with the same role the name decides, so the order does not jump", () => {
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

  test("a tie is broken by name ascending even when the primary sort descends", () => {
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

  test("compares numbers by value, so rows with similar numbers land next to each other", () => {
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
