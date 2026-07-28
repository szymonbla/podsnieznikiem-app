import { describe, expect, test } from "bun:test"

import {
  formatPhone,
  isCompletePhone,
  isEmptyPhone,
  normalizePhone,
  parsePhone,
  phoneDial,
  phoneDigits,
  phoneHref,
  phoneReadable
} from "../domain/phone"

describe("czytelny zapis numeru", () => {
  test("splits nine digits into threes so they can be copied without a slip", () => {
    expect(formatPhone("602118447")).toBe("602 118 447")
  })

  test("shows a number of unusual length raw instead of cutting it at a random place", () => {
    expect(formatPhone("12345")).toBe("12345")
    expect(formatPhone("6021184471234")).toBe("6021184471234")
  })

  test("adres do wybrania numeru niesie kierunkowy, bo telefon nie zna kontekstu kraju", () => {
    expect(phoneHref("602118447")).toBe("tel:+48602118447")
  })
})

describe("reducing a number to a comparable form", () => {
  test("ignores spaces and dashes, so a number pasted from anywhere matches", () => {
    expect(normalizePhone("602 118 447")).toBe("602118447")
    expect(normalizePhone("602-118-447")).toBe("602118447")
    expect(normalizePhone("(602) 118 447")).toBe("602118447")
  })

  test("strips the dialling prefix in every notation people paste it in", () => {
    expect(normalizePhone("+48602118447")).toBe("602118447")
    expect(normalizePhone("+48 602 118 447")).toBe("602118447")
    expect(normalizePhone("0048602118447")).toBe("602118447")
    expect(normalizePhone("48602118447")).toBe("602118447")
  })

  test("strips the prefix from a fragment too, when it is written explicitly", () => {
    expect(normalizePhone("+48 602")).toBe("602")
  })

  test("samo 48 zostaje fragmentem numeru — bez plusa to nie jest kierunkowy", () => {
    expect(normalizePhone("48")).toBe("48")
    expect(normalizePhone("48 60")).toBe("4860")
  })

  test("text without digits leaves nothing, so it does not pose as a number query", () => {
    expect(normalizePhone("hydraulik")).toBe("")
  })
})

describe("jeden odczyt numeru, trzy pytania do niego", () => {
  test("gives the digits, the readable form and the dial address from a single parse", () => {
    const phone = parsePhone("+48 602-118-447")

    expect(phoneDigits(phone)).toBe("602118447")
    expect(phoneReadable(phone)).toBe("602 118 447")
    expect(phoneDial(phone)).toBe("tel:+48602118447")
  })

  test("parsing an already parsed number changes nothing — normalisation happens once", () => {
    const once = parsePhone("602 118 447")
    const twice = parsePhone(phoneDigits(once))

    expect(phoneDigits(twice)).toBe(phoneDigits(once))
  })

  test("tells a whole number from a fragment, so a query is not mistaken for a contact", () => {
    expect(isCompletePhone(parsePhone("602 118 447"))).toBe(true)
    expect(isCompletePhone(parsePhone("602 118"))).toBe(false)
    expect(isEmptyPhone(parsePhone("hydraulik"))).toBe(true)
    expect(isEmptyPhone(parsePhone("602"))).toBe(false)
  })
})
