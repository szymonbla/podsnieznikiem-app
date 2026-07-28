import { afterAll, afterEach, beforeAll, describe, expect, test } from "bun:test"
import { screen, within } from "@testing-library/react"

import { aContact, apiHandlers, mockApi, renderApp } from "../../../__tests__/harness"

beforeAll(() => mockApi.listen({ onUnhandledRequest: "error" }))
afterEach(() => mockApi.resetHandlers())
afterAll(() => mockApi.close())

describe("lista kontaktów na ekranie", () => {
  test("pokazuje kontakty pobrane z API w tabeli", async () => {
    mockApi.use(
      apiHandlers.contacts([
        aContact({ name: "Anna Kowalska", role: "Księgowa", phone: "600100200" }),
        aContact({ name: "Marek Nowak", role: "Hydraulik", phone: "512345678" })
      ])
    )

    renderApp("/kontakty")

    const anna = await screen.findByRole("row", { name: /Anna Kowalska/ })
    expect(within(anna).getByText("Księgowa")).toBeDefined()
    expect(within(anna).getByText("600100200")).toBeDefined()

    const marek = screen.getByRole("row", { name: /Marek Nowak/ })
    expect(within(marek).getByText("Hydraulik")).toBeDefined()
    expect(within(marek).getByText("512345678")).toBeDefined()
  })

  test("opisuje kolumny nagłówkami, po których poznaje się zawartość", async () => {
    mockApi.use(apiHandlers.contacts([aContact()]))

    renderApp("/kontakty")

    await screen.findByRole("row", { name: /Grzegorz Sobczak/ })

    expect(
      screen.getAllByRole("columnheader").map((header) => header.textContent)
    ).toEqual(["Imię i nazwisko", "Specjalizacja", "Telefon"])
  })

  test("nie pokazuje żadnego wiersza, gdy API zwraca pustą listę", async () => {
    mockApi.use(apiHandlers.contacts([]))

    renderApp("/kontakty")

    await screen.findByRole("table")

    // zostaje sam nagłówek — brak kontaktów to brak wierszy, nie pusty ekran
    expect(screen.getAllByRole("row")).toHaveLength(1)
  })
})
