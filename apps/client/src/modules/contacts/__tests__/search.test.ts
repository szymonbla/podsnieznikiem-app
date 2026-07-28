import { describe, expect, test } from "bun:test"

import { aContact } from "../../../__tests__/contact-builder"
import { matchesQuery } from "../integration/search"

const hydraulik = aContact({
  name: "Marek Nowak",
  role: "Hydraulik",
  phone: "602118447"
})

describe("dopasowanie kontaktu do zapytania", () => {
  test("obejmuje wszystkie trzy pola naraz — właściciel nie wybiera, czym szuka", () => {
    expect(matchesQuery(hydraulik, "Nowak")).toBe(true)
    expect(matchesQuery(hydraulik, "Hydraulik")).toBe(true)
    expect(matchesQuery(hydraulik, "602118447")).toBe(true)
  })

  test("nie zwraca uwagi na wielkość liter, także w polskich znakach", () => {
    expect(matchesQuery(aContact({ role: "Księgowa" }), "KSIĘGOWA")).toBe(true)
    expect(matchesQuery(hydraulik, "hYdRaUlIk")).toBe(true)
  })

  test("łapie fragment, nie tylko całe słowo", () => {
    expect(matchesQuery(hydraulik, "owa")).toBe(true)
    expect(matchesQuery(hydraulik, "2118")).toBe(true)
  })

  test("numer wklejony z odstępami, myślnikami i kierunkowym pasuje tak samo", () => {
    expect(matchesQuery(hydraulik, "602 118 447")).toBe(true)
    expect(matchesQuery(hydraulik, "602-118-447")).toBe(true)
    expect(matchesQuery(hydraulik, "+48 602 118 447")).toBe(true)
    expect(matchesQuery(hydraulik, "+48 602 118")).toBe(true)
  })

  test("cyfra zgubiona wśród liter nie jest zapytaniem o numer", () => {
    // „mar1" ma pasować do nazwiska albo do niczego — nie do każdego numeru z jedynką.
    expect(matchesQuery(hydraulik, "mar1")).toBe(false)
    expect(matchesQuery(hydraulik, "hydraulik2")).toBe(false)
  })

  test("odrzuca to, czego nie ma w żadnym z trzech pól", () => {
    expect(matchesQuery(hydraulik, "ślusarz")).toBe(false)
    expect(matchesQuery(hydraulik, "999999999")).toBe(false)
  })
})
