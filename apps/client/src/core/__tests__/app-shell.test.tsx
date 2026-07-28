import { describe, expect, test } from "bun:test"
import { screen, within } from "@testing-library/react"

import { aContact, apiHandlers, mockApi, renderApp } from "../../__tests__/harness"

const renderShell = async () => {
  mockApi.use(apiHandlers.contacts([aContact()]))
  renderApp("/kontakty")
  return screen.findByRole("navigation")
}

describe("powłoka aplikacji", () => {
  test("nazywa domek właściciela, zamiast być anonimowym panelem", async () => {
    await renderShell()

    expect(within(screen.getByRole("navigation")).getByText("Pod Śnieżnikiem")).toBeDefined()
  })

  test("oznacza Kontakty jako miejsce, w którym właściciel właśnie jest", async () => {
    const nav = await renderShell()

    const kontakty = within(nav).getByRole("link", { name: "Kontakty" })
    expect(kontakty.getAttribute("aria-current")).toBe("page")
  })

  test("zapowiada nadchodzące sekcje i oznacza je jako niegotowe", async () => {
    const nav = await renderShell()

    const group = within(nav).getByRole("list", { name: "Wkrótce" })

    for (const label of ["Rezerwacje", "Finanse", "Zapytania"]) {
      const item = within(group).getByRole("link", { name: new RegExp(`^${label}`) })
      expect(item.getAttribute("aria-disabled")).toBe("true")
      // czytnik ekranu ma usłyszeć, że sekcja jeszcze nie działa, nie tylko ją zobaczyć
      expect(item.textContent).toContain("Wkrótce")
    }
  })

  test("nie prowadzi donikąd z niegotowych sekcji", async () => {
    const nav = await renderShell()

    const rezerwacje = within(nav).getByRole("link", { name: /^Rezerwacje/ })
    expect(rezerwacje.getAttribute("href")).toBeNull()
  })

  test("podpisuje się właścicielem domku", async () => {
    const nav = await renderShell()

    expect(within(nav).getByText("Szymon Błażyński")).toBeDefined()
    expect(within(nav).getByText("Właściciel")).toBeDefined()
  })

  test("zostawia ekran Kontaktów w głównej treści strony", async () => {
    await renderShell()

    expect(within(screen.getByRole("main")).getByRole("table")).toBeDefined()
  })
})
