import { describe, expect, test } from "bun:test"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { aTask, mockApi, renderApp, taskApiHandlers, tasksApi } from "../../../__tests__/harness"

const rows = () => screen.getAllByRole("row").slice(1)
const descriptions = () => rows().map((row) => within(row).getAllByRole("cell")[0]?.textContent)

describe("the task list on screen", () => {
  test("shows tasks sorted by due date, soonest first", async () => {
    mockApi.use(taskApiHandlers.tasks([
      aTask({ description: "Późniejsze", dueDate: "2026-12-20" }),
      aTask({ description: "Wcześniejsze", dueDate: "2026-12-01" })
    ]))

    renderApp("/zadania")

    await screen.findByRole("row", { name: /Wcześniejsze/ })
    expect(descriptions()).toEqual(["Wcześniejsze", "Późniejsze"])
  })

  test("highlights an overdue task", async () => {
    mockApi.use(taskApiHandlers.tasks([aTask({ description: "Zaległe", overdue: true })]))
    renderApp("/zadania")
    const row = await screen.findByRole("row", { name: /Zaległe/ })
    // the "Zaległe" badge and the description share the word by design, so both must be present
    expect(within(row).getAllByText("Zaległe")).toHaveLength(2)
  })

  test("hides a task marked done", async () => {
    mockApi.use(taskApiHandlers.tasks([
      aTask({ description: "Zrobione", done: true }),
      aTask({ description: "Aktywne", done: false })
    ]))
    renderApp("/zadania")
    await screen.findByRole("row", { name: /Aktywne/ })
    expect(screen.queryByText("Zrobione")).toBeNull()
  })

  test("shows the recurrence summary and a day/month due-date stamp", async () => {
    mockApi.use(taskApiHandlers.tasks([
      aTask({ description: "Ubezpieczenie", recurrence: { type: "yearly", month: 11, day: 17 }, dueDate: "2026-11-17" })
    ]))
    renderApp("/zadania")
    const row = await screen.findByRole("row", { name: /Ubezpieczenie/ })
    expect(within(row).getByText("17")).toBeDefined()
    expect(within(row).getByText("LIS")).toBeDefined()
    expect(within(row).getByLabelText("17 listopada 2026")).toBeDefined()
    expect(within(row).getByText("Co rok — 17 listopada")).toBeDefined()
  })

  test("says it is loading, then shows an empty state with nothing to show", async () => {
    mockApi.use(taskApiHandlers.tasksPending())
    renderApp("/zadania")
    expect(await screen.findByText("Wczytuję zadań…".replace("zadań", "zadania"))).toBeDefined()
  })

  test("with no tasks it invites adding the first one", async () => {
    mockApi.use(taskApiHandlers.tasks([]))
    renderApp("/zadania")
    expect(await screen.findByText("Nie masz jeszcze żadnego zadania")).toBeDefined()
  })

  test("with every task done it invites adding the first one, not an empty table", async () => {
    mockApi.use(taskApiHandlers.tasks([aTask({ description: "Zrobione", done: true })]))
    renderApp("/zadania")
    expect(await screen.findByText("Nie masz jeszcze żadnego zadania")).toBeDefined()
    expect(screen.queryByRole("table")).toBeNull()
  })

  test("a connection error talks about the connection", async () => {
    mockApi.use(taskApiHandlers.tasksUnreachable())
    renderApp("/zadania")
    const message = await screen.findByRole("alert")
    expect(within(message).getByText("Nie udało się wczytać zadań")).toBeDefined()
  })
})

describe("adding and editing a task", () => {
  test("adds a one-time task", async () => {
    const user = userEvent.setup()
    const api = tasksApi()
    mockApi.use(...api.handlers)
    renderApp("/zadania")

    await user.click(await screen.findByRole("button", { name: "Nowe zadanie" }))
    await screen.findByRole("dialog")
    await user.type(screen.getByRole("textbox", { name: "Opis" }), "Przegląd pieca")
    await user.type(screen.getByLabelText("Data"), "2026-12-01")
    await user.click(screen.getByRole("button", { name: "Dodaj zadanie" }))

    expect(await screen.findByText("Dodano zadanie: Przegląd pieca")).toBeDefined()
    await waitFor(() => expect(api.requests).toHaveLength(1))
    expect(api.requests[0]?.body.recurrence).toEqual({ type: "once", date: "2026-12-01" })
  })

  test("switching to weekly shows the weekday field instead of the date", async () => {
    const user = userEvent.setup()
    mockApi.use(...tasksApi().handlers)
    renderApp("/zadania")

    await user.click(await screen.findByRole("button", { name: "Nowe zadanie" }))
    await screen.findByRole("dialog")
    await user.selectOptions(screen.getByRole("combobox", { name: "Rodzaj cykliczności" }), "weekly")

    expect(screen.queryByLabelText("Data")).toBeNull()
    expect(screen.getByRole("combobox", { name: "Dzień tygodnia" })).toBeDefined()
  })

  test("adds a weekly task", async () => {
    const user = userEvent.setup()
    const api = tasksApi()
    mockApi.use(...api.handlers)
    renderApp("/zadania")

    await user.click(await screen.findByRole("button", { name: "Nowe zadanie" }))
    await user.type(screen.getByRole("textbox", { name: "Opis" }), "Wynieś śmieci")
    await user.selectOptions(screen.getByRole("combobox", { name: "Rodzaj cykliczności" }), "weekly")
    await user.selectOptions(screen.getByRole("combobox", { name: "Dzień tygodnia" }), "1")
    await user.click(screen.getByRole("button", { name: "Dodaj zadanie" }))

    await waitFor(() => expect(api.requests).toHaveLength(1))
    expect(api.requests[0]?.body.recurrence).toEqual({ type: "weekly", weekday: 1 })
  })

  test("adds a monthly task", async () => {
    const user = userEvent.setup()
    const api = tasksApi()
    mockApi.use(...api.handlers)
    renderApp("/zadania")

    await user.click(await screen.findByRole("button", { name: "Nowe zadanie" }))
    await user.type(screen.getByRole("textbox", { name: "Opis" }), "Czynsz")
    await user.selectOptions(screen.getByRole("combobox", { name: "Rodzaj cykliczności" }), "monthly")
    await user.type(screen.getByRole("spinbutton", { name: "Dzień miesiąca" }), "10")
    await user.click(screen.getByRole("button", { name: "Dodaj zadanie" }))

    await waitFor(() => expect(api.requests).toHaveLength(1))
    expect(api.requests[0]?.body.recurrence).toEqual({ type: "monthly", dayOfMonth: 10 })
  })

  test("adds a custom-interval task", async () => {
    const user = userEvent.setup()
    const api = tasksApi()
    mockApi.use(...api.handlers)
    renderApp("/zadania")

    await user.click(await screen.findByRole("button", { name: "Nowe zadanie" }))
    await user.type(screen.getByRole("textbox", { name: "Opis" }), "Filtr wody")
    await user.selectOptions(screen.getByRole("combobox", { name: "Rodzaj cykliczności" }), "custom")
    await user.type(screen.getByRole("spinbutton", { name: "Co ile" }), "3")
    await user.selectOptions(screen.getByRole("combobox", { name: "Jednostka" }), "months")
    await user.type(screen.getByLabelText("Data początkowa"), "2026-01-15")
    await user.click(screen.getByRole("button", { name: "Dodaj zadanie" }))

    await waitFor(() => expect(api.requests).toHaveLength(1))
    expect(api.requests[0]?.body.recurrence).toEqual({
      type: "custom", intervalValue: 3, intervalUnit: "months", anchorDate: "2026-01-15"
    })
  })

  test("adds a yearly task matching the spec's own example", async () => {
    const user = userEvent.setup()
    const api = tasksApi()
    mockApi.use(...api.handlers)
    renderApp("/zadania")

    await user.click(await screen.findByRole("button", { name: "Nowe zadanie" }))
    await user.type(screen.getByRole("textbox", { name: "Opis" }), "Ubezpieczenie")
    await user.selectOptions(screen.getByRole("combobox", { name: "Rodzaj cykliczności" }), "yearly")
    await user.selectOptions(screen.getByRole("combobox", { name: "Miesiąc" }), "11")
    await user.type(screen.getByRole("spinbutton", { name: "Dzień" }), "17")
    await user.click(screen.getByRole("button", { name: "Dodaj zadanie" }))

    await waitFor(() => expect(api.requests).toHaveLength(1))
    // the schema transforms the select/number field strings into the Int the API contract expects
    expect(api.requests[0]?.body.recurrence).toEqual({ type: "yearly", month: 11, day: 17 })
  })

  test("rejects an empty description", async () => {
    const user = userEvent.setup()
    mockApi.use(...tasksApi().handlers)
    renderApp("/zadania")

    await user.click(await screen.findByRole("button", { name: "Nowe zadanie" }))
    const description = screen.getByRole("textbox", { name: "Opis" })
    await user.click(description)
    await user.tab()

    expect(await screen.findByText("Opisz zadanie")).toBeDefined()
  })

  test("opens the form pre-filled when editing", async () => {
    const user = userEvent.setup()
    mockApi.use(...tasksApi([aTask({ description: "Faktura", recurrence: { type: "monthly", dayOfMonth: 1 } })]).handlers)
    renderApp("/zadania")

    await user.click(await screen.findByRole("button", { name: "Faktura" }))
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByRole("heading", { name: "Edycja zadania" })).toBeDefined()
    expect((screen.getByRole("spinbutton", { name: "Dzień miesiąca" }) as HTMLInputElement).value).toBe("1")
  })
})

describe("marking a task done", () => {
  test("hides it from the list and offers undo", async () => {
    const user = userEvent.setup()
    mockApi.use(...tasksApi([aTask({ description: "Wynieś śmieci" })]).handlers)
    renderApp("/zadania")

    await user.click(await screen.findByRole("button", { name: /Akcje zadania/ }))
    await user.click(await screen.findByRole("menuitem", { name: "Oznacz jako zrobione" }))

    expect(await screen.findByText("Oznaczono jako zrobione: Wynieś śmieci")).toBeDefined()
    await waitFor(() => expect(screen.queryByText("Wynieś śmieci")).toBeNull())
  })

  test("undo brings it back", async () => {
    const user = userEvent.setup()
    mockApi.use(...tasksApi([aTask({ description: "Wynieś śmieci" })]).handlers)
    renderApp("/zadania")

    await user.click(await screen.findByRole("button", { name: /Akcje zadania/ }))
    await user.click(await screen.findByRole("menuitem", { name: "Oznacz jako zrobione" }))
    await user.click(await screen.findByRole("button", { name: "Cofnij" }))

    expect(await screen.findByText("Cofnięto oznaczenie — Wynieś śmieci")).toBeDefined()
    await waitFor(() => expect(screen.getByRole("row", { name: /Wynieś śmieci/ })).toBeDefined())
  })
})

describe("deleting a task", () => {
  test("asks for confirmation, then removes it and offers undo", async () => {
    const user = userEvent.setup()
    const api = tasksApi([aTask({ description: "Odśnieżanie" })])
    mockApi.use(...api.handlers)
    renderApp("/zadania")

    await user.click(await screen.findByRole("button", { name: /Akcje zadania/ }))
    await user.click(await screen.findByRole("menuitem", { name: "Usuń" }))
    const dialog = await screen.findByRole("alertdialog")
    expect(within(dialog).getByText(/Odśnieżanie/)).toBeDefined()

    await user.click(screen.getByRole("button", { name: "Usuń zadanie" }))

    expect(await screen.findByText("Usunięto zadanie: Odśnieżanie")).toBeDefined()
    await waitFor(() => expect(screen.queryByText("Odśnieżanie")).toBeNull())
  })

  test("undo re-creates the task with a new id", async () => {
    const user = userEvent.setup()
    const api = tasksApi([aTask({ description: "Odśnieżanie" })])
    mockApi.use(...api.handlers)
    renderApp("/zadania")
    const [original] = api.current()

    await user.click(await screen.findByRole("button", { name: /Akcje zadania/ }))
    await user.click(await screen.findByRole("menuitem", { name: "Usuń" }))
    await screen.findByRole("alertdialog")
    await user.click(screen.getByRole("button", { name: "Usuń zadanie" }))
    await user.click(await screen.findByRole("button", { name: "Cofnij" }))

    expect(await screen.findByText("Przywrócono zadanie: Odśnieżanie")).toBeDefined()
    const [restored] = api.current()
    expect(restored?.id).not.toBe(original?.id)
  })
})
