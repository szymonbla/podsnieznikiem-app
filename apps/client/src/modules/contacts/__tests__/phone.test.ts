import { describe, expect, test } from "bun:test"

import { formatPhone, normalizePhone, phoneHref } from "../domain/phone"

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
