import { describe, expect, test } from "bun:test"
import { screen, within } from "@testing-library/react"

import { aContact, apiHandlers, mockApi, renderApp } from "../../__tests__/harness"

const renderShell = async () => {
  mockApi.use(apiHandlers.contacts([aContact()]))
  renderApp("/kontakty")
  return screen.findByRole("navigation")
}

describe("application shell", () => {
  test("names the owner's cottage instead of being an anonymous panel", async () => {
    await renderShell()

    expect(within(screen.getByRole("navigation")).getByText("Pod Śnieżnikiem")).toBeDefined()
  })

  test("marks Contacts as the place the owner is currently in", async () => {
    const nav = await renderShell()

    const kontakty = within(nav).getByRole("link", { name: "Kontakty" })
    expect(kontakty.getAttribute("aria-current")).toBe("page")
  })

  test("announces the upcoming sections and marks them as not ready", async () => {
    const nav = await renderShell()

    const group = within(nav).getByRole("list", { name: "Wkrótce" })

    for (const label of ["Rezerwacje", "Finanse", "Zapytania"]) {
      const item = within(group).getByRole("link", { name: new RegExp(`^${label}`) })
      expect(item.getAttribute("aria-disabled")).toBe("true")
      // a screen reader should hear that the section does not work yet, not just see it
      expect(item.textContent).toContain("Wkrótce")
    }
  })

  test("leads nowhere from the sections that are not ready", async () => {
    const nav = await renderShell()

    const rezerwacje = within(nav).getByRole("link", { name: /^Rezerwacje/ })
    expect(rezerwacje.getAttribute("href")).toBeNull()
  })

  test("signs itself with the cottage owner", async () => {
    const nav = await renderShell()

    expect(within(nav).getByText("Szymon Błażyński")).toBeDefined()
    expect(within(nav).getByText("Właściciel")).toBeDefined()
  })

  test("leaves the Contacts screen in the page's main content", async () => {
    await renderShell()

    expect(within(screen.getByRole("main")).getByRole("table")).toBeDefined()
  })
})
