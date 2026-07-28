import { describe, expect, test } from "bun:test"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { aContact, apiHandlers, contactsApi, mockApi, renderApp } from "../../../__tests__/harness"

/**
 * The rows as they stand, including the ones a modal has hidden from the
 * accessibility tree — an open dialog must not stop the test from looking at
 * the list underneath it.
 */
const rows = () => screen.getAllByRole("row", { hidden: true }).slice(1)

const rowContents = () =>
  rows().map((row) =>
    within(row)
      .getAllByRole("cell", { hidden: true })
      .slice(0, 3)
      .map((cell) => cell.textContent)
      .join(" · ")
  )

/**
 * From this moment on the list can only come from the cache. The invalidation
 * that follows every write hangs, so whatever stays on screen is the rollback's
 * doing and not a fresh answer from the API.
 */
const freezeRefetch = () => mockApi.use(apiHandlers.contactsPending())

const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole("button", { name: /Akcje kontaktu/ }))
}

/** A failure with nothing to pin on a field — the write simply did not happen. */
const serverDown = { status: 500, body: {} } as const

describe("a write that failed leaves the list as it was", () => {
  test("a failed add takes the contact off the list again", async () => {
    const user = userEvent.setup()
    mockApi.use(
      ...contactsApi([aContact({ name: "Zofia Wilk", role: "Sprzątanie" })], serverDown).handlers
    )

    renderApp("/kontakty")

    await screen.findByRole("row", { name: /Zofia Wilk/ })
    const before = rowContents()
    freezeRefetch()

    await user.click(screen.getByRole("button", { name: "Nowy kontakt" }))
    await screen.findByRole("dialog")
    await user.type(screen.getByRole("textbox", { name: "Imię i nazwisko" }), "Anna Kowalska")
    await user.type(screen.getByRole("combobox", { name: "Specjalizacja" }), "Księgowa")
    await user.type(screen.getByRole("textbox", { name: "Telefon" }), "600100200")
    await user.click(screen.getByRole("button", { name: "Dodaj kontakt" }))

    expect(await screen.findByText("Nie udało się dodać kontaktu")).toBeDefined()
    await waitFor(() => {
      expect(rowContents()).toEqual(before)
    })
  })

  test("a failed edit brings the row's previous values back", async () => {
    const user = userEvent.setup()
    mockApi.use(
      ...contactsApi(
        [aContact({ name: "Marek Nowak", role: "Hydraulik", phone: "602118447" })],
        serverDown
      ).handlers
    )

    renderApp("/kontakty")

    await screen.findByRole("row", { name: /Marek Nowak/ })
    const before = rowContents()
    freezeRefetch()

    await openMenu(user)
    await user.click(await screen.findByRole("menuitem", { name: "Edytuj" }))
    await screen.findByRole("dialog")

    const role = screen.getByRole("combobox", { name: "Specjalizacja" })
    await user.clear(role)
    await user.type(role, "Elektryk")
    await user.click(screen.getByRole("button", { name: "Zapisz zmiany" }))

    expect(await screen.findByText("Nie udało się zapisać zmian")).toBeDefined()
    await waitFor(() => {
      expect(rowContents()).toEqual(before)
    })
  })

  test("a failed deletion puts the row back on the list", async () => {
    const user = userEvent.setup()
    mockApi.use(
      ...contactsApi(
        [
          aContact({ name: "Marek Nowak", role: "Hydraulik" }),
          aContact({ name: "Zofia Wilk", role: "Sprzątanie" })
        ],
        serverDown
      ).handlers
    )

    renderApp("/kontakty")

    await screen.findByRole("row", { name: /Marek Nowak/ })
    const before = rowContents()
    freezeRefetch()

    await user.click(await screen.findByRole("button", { name: "Akcje kontaktu Marek Nowak" }))
    await user.click(await screen.findByRole("menuitem", { name: "Usuń" }))
    await screen.findByRole("alertdialog")
    await user.click(screen.getByRole("button", { name: "Usuń kontakt" }))

    expect(await screen.findByText("Nie udało się usunąć kontaktu")).toBeDefined()
    await waitFor(() => {
      expect(rowContents()).toEqual(before)
    })
  })
})
