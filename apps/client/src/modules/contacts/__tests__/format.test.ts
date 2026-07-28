import { describe, expect, test } from "bun:test"

import { formatPhone, normalizePhone, phoneHref } from "../integration/format"

describe("czytelny zapis numeru", () => {
  test("dzieli dziewięć cyfr na trójki, żeby dało się je przepisać bez pomyłki", () => {
    expect(formatPhone("602118447")).toBe("602 118 447")
  })

  test("numer o nietypowej długości pokazuje surowo, zamiast ciąć go w przypadkowym miejscu", () => {
    expect(formatPhone("12345")).toBe("12345")
    expect(formatPhone("6021184471234")).toBe("6021184471234")
  })

  test("adres do wybrania numeru niesie kierunkowy, bo telefon nie zna kontekstu kraju", () => {
    expect(phoneHref("602118447")).toBe("tel:+48602118447")
  })
})

describe("sprowadzanie numeru do porównywalnej postaci", () => {
  test("pomija odstępy i myślniki, więc numer wklejony skądkolwiek pasuje", () => {
    expect(normalizePhone("602 118 447")).toBe("602118447")
    expect(normalizePhone("602-118-447")).toBe("602118447")
    expect(normalizePhone("(602) 118 447")).toBe("602118447")
  })

  test("ścina prefiks kierunkowy w każdym zapisie, w jakim ludzie go wklejają", () => {
    expect(normalizePhone("+48602118447")).toBe("602118447")
    expect(normalizePhone("+48 602 118 447")).toBe("602118447")
    expect(normalizePhone("0048602118447")).toBe("602118447")
    expect(normalizePhone("48602118447")).toBe("602118447")
  })

  test("ścina kierunkowy także z fragmentu, gdy zapisano go jawnie", () => {
    expect(normalizePhone("+48 602")).toBe("602")
  })

  test("samo 48 zostaje fragmentem numeru — bez plusa to nie jest kierunkowy", () => {
    expect(normalizePhone("48")).toBe("48")
    expect(normalizePhone("48 60")).toBe("4860")
  })

  test("z tekstu bez cyfr nie zostaje nic, więc nie udaje zapytania o numer", () => {
    expect(normalizePhone("hydraulik")).toBe("")
  })
})
