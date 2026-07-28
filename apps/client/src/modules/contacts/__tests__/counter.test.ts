import { describe, expect, test } from "bun:test"

import { contactsCount, contactsMatchCount } from "../presentation/copy"

describe("odmiana liczebnika przy kontaktach", () => {
  test("jeden kontakt zostaje w liczbie pojedynczej", () => {
    expect(contactsCount(1)).toBe("1 kontakt")
  })

  test("two, three and four take the -y ending", () => {
    expect(contactsCount(2)).toBe("2 kontakty")
    expect(contactsCount(3)).toBe("3 kontakty")
    expect(contactsCount(4)).toBe("4 kontakty")
  })

  test("numbers ending in 2-4 follow the same rule", () => {
    expect(contactsCount(22)).toBe("22 kontakty")
    expect(contactsCount(24)).toBe("24 kontakty")
    expect(contactsCount(103)).toBe("103 kontakty")
  })

  test("the teens are the exception — 12, 13 and 14 take the genitive despite their ending", () => {
    expect(contactsCount(12)).toBe("12 kontaktów")
    expect(contactsCount(13)).toBe("13 kontaktów")
    expect(contactsCount(14)).toBe("14 kontaktów")
    expect(contactsCount(112)).toBe("112 kontaktów")
  })

  test("zero and the rest take the genitive", () => {
    expect(contactsCount(0)).toBe("0 kontaktów")
    expect(contactsCount(5)).toBe("5 kontaktów")
    expect(contactsCount(11)).toBe("11 kontaktów")
    expect(contactsCount(25)).toBe("25 kontaktów")
  })

  test("under a filter it shows the result against the whole", () => {
    expect(contactsMatchCount(3, 24)).toBe("3 z 24")
    expect(contactsMatchCount(0, 1)).toBe("0 z 1")
  })
})
