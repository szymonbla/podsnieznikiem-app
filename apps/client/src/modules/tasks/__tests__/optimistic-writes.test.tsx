import { describe, expect, test } from "bun:test"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { aTask, mockApi, renderApp, taskApiHandlers, tasksApi } from "../../../__tests__/harness"

const rows = () => screen.getAllByRole("row", { hidden: true }).slice(1)
const rowText = () => rows().map((row) => within(row).getAllByRole("cell", { hidden: true })[0]?.textContent)
const freezeRefetch = () => mockApi.use(taskApiHandlers.tasksPending())
const serverDown = { status: 500, body: {} } as const

describe("a write that failed leaves the list as it was", () => {
  test("a failed add takes the task off the list again", async () => {
    const user = userEvent.setup()
    mockApi.use(...tasksApi([aTask({ description: "Istniejące" })], serverDown).handlers)
    renderApp("/zadania")

    await screen.findByRole("row", { name: /Istniejące/ })
    const before = rowText()
    freezeRefetch()

    await user.click(screen.getByRole("button", { name: "Nowe zadanie" }))
    await screen.findByRole("dialog")
    await user.type(screen.getByRole("textbox", { name: "Opis" }), "Nowe")
    await user.type(screen.getByLabelText("Data"), "2026-12-01")
    await user.click(screen.getByRole("button", { name: "Dodaj zadanie" }))

    expect(await screen.findByText("Nie udało się dodać zadania")).toBeDefined()
    await waitFor(() => expect(rowText()).toEqual(before))
  })

  test("a failed deletion puts the row back", async () => {
    const user = userEvent.setup()
    mockApi.use(...tasksApi([aTask({ description: "Odśnieżanie" })], serverDown).handlers)
    renderApp("/zadania")

    await screen.findByRole("row", { name: /Odśnieżanie/ })
    const before = rowText()
    freezeRefetch()

    await user.click(await screen.findByRole("button", { name: /Akcje zadania/ }))
    await user.click(await screen.findByRole("menuitem", { name: "Usuń" }))
    await screen.findByRole("alertdialog")
    await user.click(screen.getByRole("button", { name: "Usuń zadanie" }))

    expect(await screen.findByText("Nie udało się usunąć zadania")).toBeDefined()
    await waitFor(() => expect(rowText()).toEqual(before))
  })

  test("a failed completion leaves the task visible", async () => {
    const user = userEvent.setup()
    mockApi.use(...tasksApi([aTask({ description: "Wynieś śmieci" })], serverDown).handlers)
    renderApp("/zadania")

    await screen.findByRole("row", { name: /Wynieś śmieci/ })
    freezeRefetch()

    await user.click(await screen.findByRole("button", { name: /Akcje zadania/ }))
    await user.click(await screen.findByRole("menuitem", { name: "Oznacz jako zrobione" }))

    expect(await screen.findByText("Nie udało się oznaczyć zadania jako zrobione")).toBeDefined()
    await waitFor(() => expect(screen.getByRole("row", { name: /Wynieś śmieci/ })).toBeDefined())
  })
})
