import { describe, expect, test } from "bun:test"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { aContact, apiHandlers, mockApi, renderApp } from "../../../__tests__/harness"

/**
 * The names in the order they stand on screen — without the header row. It goes
 * by roles rather than by tags, so rebuilding the table does not break the test
 * as long as rows and cells stay rows and cells.
 */
const visibleNames = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0]?.textContent)

describe("the contact list on screen", () => {
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
    expect(within(anna).getByText("600 100 200")).toBeDefined()

    const marek = screen.getByRole("row", { name: /Marek Nowak/ })
    expect(within(marek).getByText("Hydraulik")).toBeDefined()
    expect(within(marek).getByText("512 345 678")).toBeDefined()
  })

  test("labels the columns with headings that identify their content", async () => {
    mockApi.use(apiHandlers.contacts([aContact()]))

    renderApp("/kontakty")

    await screen.findByRole("row", { name: /Grzegorz Sobczak/ })

    // The three data columns are named by a button, because besides naming they sort.
    for (const label of ["Imię i nazwisko", "Specjalizacja", "Telefon"]) {
      expect(screen.getByRole("button", { name: label })).toBeDefined()
    }
    expect(screen.getAllByRole("columnheader")).toHaveLength(4)
  })
})

describe("the phone number", () => {
  test("shows the number with spaces so it can be copied without a slip", async () => {
    mockApi.use(apiHandlers.contacts([aContact({ phone: "602118447" })]))

    renderApp("/kontakty")

    expect(await screen.findByText("602 118 447")).toBeDefined()
  })

  test("the number can be dialled with one click", async () => {
    mockApi.use(apiHandlers.contacts([aContact({ phone: "602118447" })]))

    renderApp("/kontakty")

    const call = await screen.findByRole("link", { name: "Zadzwoń pod numer 602 118 447" })
    expect(call.getAttribute("href")).toBe("tel:+48602118447")
  })

  test("copies the number in readable form and confirms it reached the clipboard", async () => {
    const user = userEvent.setup()
    mockApi.use(apiHandlers.contacts([aContact({ phone: "602118447" })]))

    renderApp("/kontakty")

    await user.click(await screen.findByRole("button", { name: /Akcje kontaktu/ }))
    await user.click(await screen.findByRole("menuitem", { name: "Kopiuj numer" }))

    expect(await navigator.clipboard.readText()).toBe("602 118 447")
    expect(await screen.findByText("Numer skopiowany do schowka")).toBeDefined()
  })
})

describe("the contact counter", () => {
  test("inflects the numeral so the interface does not look unfinished", async () => {
    mockApi.use(apiHandlers.contacts([aContact(), aContact(), aContact()]))

    renderApp("/kontakty")

    expect(await screen.findByText("3 kontakty")).toBeDefined()
  })

  test("under a filter it shows the result against the whole", async () => {
    const user = userEvent.setup()
    mockApi.use(
      apiHandlers.contacts([
        aContact({ name: "Anna Kowalska", role: "Księgowa" }),
        aContact({ name: "Marek Nowak", role: "Hydraulik" }),
        aContact({ name: "Ewa Lis", role: "Elektryk" })
      ])
    )

    renderApp("/kontakty")

    await user.type(await screen.findByRole("searchbox"), "Hydraulik")

    expect(await screen.findByText("1 z 3")).toBeDefined()
  })
})

describe("sorting the list", () => {
  const trio = () => [
    aContact({ name: "Marek Nowak", role: "Hydraulik", phone: "602118447" }),
    aContact({ name: "Anna Kowalska", role: "Złota rączka", phone: "512345678" }),
    aContact({ name: "Łukasz Mazur", role: "Elektryk", phone: "555666777" })
  ]

  test("orders the list alphabetically by name by default, with Polish characters in place", async () => {
    mockApi.use(apiHandlers.contacts(trio()))

    renderApp("/kontakty")

    await screen.findByRole("table")
    expect(visibleNames()).toEqual(["Anna Kowalska", "Łukasz Mazur", "Marek Nowak"])
  })

  test("clicking a heading sorts by that column, and clicking again reverses the direction", async () => {
    const user = userEvent.setup()
    mockApi.use(apiHandlers.contacts(trio()))

    renderApp("/kontakty")

    await user.click(await screen.findByRole("button", { name: /Specjalizacja/ }))
    expect(visibleNames()).toEqual(["Łukasz Mazur", "Marek Nowak", "Anna Kowalska"])

    await user.click(screen.getByRole("button", { name: /Specjalizacja/ }))
    expect(visibleNames()).toEqual(["Anna Kowalska", "Marek Nowak", "Łukasz Mazur"])
  })

  test("sorts by number so similar entries land next to each other", async () => {
    const user = userEvent.setup()
    mockApi.use(apiHandlers.contacts(trio()))

    renderApp("/kontakty")

    await user.click(await screen.findByRole("button", { name: /Telefon/ }))

    expect(visibleNames()).toEqual(["Anna Kowalska", "Łukasz Mazur", "Marek Nowak"])
  })

  test("tells a screen reader which column the list is ordered by and in which direction", async () => {
    const user = userEvent.setup()
    mockApi.use(apiHandlers.contacts(trio()))

    renderApp("/kontakty")

    /* The header carries the direction, the button inside names it — hence the pair. */
    const sortStateOf = (label: string) =>
      screen
        .getAllByRole("columnheader")
        .find((header) => within(header).queryByRole("button", { name: label }) !== null)
        ?.getAttribute("aria-sort")

    await screen.findByRole("table")
    expect(sortStateOf("Imię i nazwisko")).toBe("ascending")
    expect(sortStateOf("Specjalizacja")).toBe("none")
    expect(sortStateOf("Telefon")).toBe("none")

    await user.click(screen.getByRole("button", { name: "Imię i nazwisko" }))
    expect(sortStateOf("Imię i nazwisko")).toBe("descending")
  })
})

describe("searching for a contact", () => {
  const trio = () => [
    aContact({ name: "Anna Kowalska", role: "Księgowa", phone: "600100200" }),
    aContact({ name: "Marek Nowak", role: "Hydraulik", phone: "512345678" }),
    aContact({ name: "Ewa Lis", role: "Elektryk", phone: "602118447" })
  ]

  const search = async (user: ReturnType<typeof userEvent.setup>, query: string) => {
    mockApi.use(apiHandlers.contacts(trio()))
    renderApp("/kontakty")
    await user.type(await screen.findByRole("searchbox"), query)
  }

  test("znajduje po nazwisku", async () => {
    const user = userEvent.setup()
    await search(user, "kowalska")

    expect(visibleNames()).toEqual(["Anna Kowalska"])
  })

  test("finds by role when the name has slipped the mind", async () => {
    const user = userEvent.setup()
    await search(user, "hydraulik")

    expect(visibleNames()).toEqual(["Marek Nowak"])
  })

  test("finds by a fragment of the number, to recognise who just called", async () => {
    const user = userEvent.setup()
    await search(user, "512345")

    expect(visibleNames()).toEqual(["Marek Nowak"])
  })

  test("a number pasted with spaces and a prefix works the same as bare digits", async () => {
    const user = userEvent.setup()
    await search(user, "+48 602 118")

    expect(visibleNames()).toEqual(["Ewa Lis"])
  })

  test("ignores letter case", async () => {
    const user = userEvent.setup()
    await search(user, "KSIĘGOWA")

    expect(visibleNames()).toEqual(["Anna Kowalska"])
  })

  test("the query can be cleared with one click", async () => {
    const user = userEvent.setup()
    await search(user, "kowalska")

    await user.click(screen.getByRole("button", { name: "Wyczyść wyszukiwanie" }))

    expect(visibleNames()).toHaveLength(3)
    expect(screen.getByRole("searchbox")).toHaveProperty("value", "")
  })

  test("filters without asking the server — the API still takes no parameters", async () => {
    const user = userEvent.setup()
    const requested: Array<string> = []
    const record = ({ request }: { request: Request }) => requested.push(request.url)
    mockApi.events.on("request:start", record)

    await search(user, "hydraulik")

    expect(visibleNames()).toEqual(["Marek Nowak"])
    expect(requested.filter((url) => url.includes("?"))).toEqual([])

    mockApi.events.removeListener("request:start", record)
  })
})

describe("the filter and the sort in the address", () => {
  const trio = () => [
    aContact({ name: "Anna Kowalska", role: "Księgowa" }),
    aContact({ name: "Marek Nowak", role: "Hydraulik" }),
    aContact({ name: "Ewa Lis", role: "Elektryk" })
  ]

  test("restores the view from the address on entry, so a link and a refresh work", async () => {
    mockApi.use(apiHandlers.contacts(trio()))

    renderApp("/kontakty?q=hydraulik")

    await screen.findByRole("table")
    expect(visibleNames()).toEqual(["Marek Nowak"])
    expect(screen.getByRole("searchbox")).toHaveProperty("value", "hydraulik")
  })

  test("restores the sort column and direction from the address too", async () => {
    mockApi.use(apiHandlers.contacts(trio()))

    renderApp("/kontakty?sort=role&dir=desc")

    await screen.findByRole("table")
    expect(visibleNames()).toEqual(["Anna Kowalska", "Marek Nowak", "Ewa Lis"])
  })

  test("wstecz po wyczyszczeniu filtra wraca do poprzedniego filtra", async () => {
    const user = userEvent.setup()
    mockApi.use(apiHandlers.contacts(trio()))

    const { goBack } = renderApp("/kontakty")

    await user.type(await screen.findByRole("searchbox"), "hydraulik")
    expect(visibleNames()).toEqual(["Marek Nowak"])

    await user.click(screen.getByRole("button", { name: "Wyczyść wyszukiwanie" }))
    expect(visibleNames()).toHaveLength(3)

    goBack()
    // The history steps back outside the event loop, so the router picks it up only now.
    await screen.findByDisplayValue("hydraulik")
    expect(visibleNames()).toEqual(["Marek Nowak"])
  })

  test("writes a change of filter and sort into the address", async () => {
    const user = userEvent.setup()
    mockApi.use(apiHandlers.contacts(trio()))

    const { currentUrl } = renderApp("/kontakty")

    await user.type(await screen.findByRole("searchbox"), "ksi")
    expect(currentUrl()).toBe("/kontakty?q=ksi")

    await user.click(screen.getByRole("button", { name: /Specjalizacja/ }))
    expect(currentUrl()).toBe("/kontakty?q=ksi&sort=role")
  })

  test("an address with made-up parameters falls back to the default view instead of breaking the screen", async () => {
    mockApi.use(apiHandlers.contacts(trio()))

    renderApp("/kontakty?sort=wiek&dir=w-lewo")

    await screen.findByRole("table")
    expect(visibleNames()).toEqual(["Anna Kowalska", "Ewa Lis", "Marek Nowak"])
  })
})

describe("the states with nothing to show", () => {
  test("says it is loading — an empty screen does not pose as having no contacts", async () => {
    mockApi.use(apiHandlers.contactsPending())

    renderApp("/kontakty")

    expect(await screen.findByText("Wczytuję kontakty…")).toBeDefined()
    expect(screen.queryByRole("table")).toBeNull()
  })

  test("with an empty database it invites adding the first number", async () => {
    mockApi.use(apiHandlers.contacts([]))

    renderApp("/kontakty")

    expect(await screen.findByText("Nie masz jeszcze żadnego kontaktu")).toBeDefined()
    expect(
      screen.getByText("Dodaj pierwszy numer, żeby wiedzieć, do kogo dzwonić przy awarii.")
    ).toBeDefined()
    expect(screen.queryByRole("table")).toBeNull()
  })

  test("when the filter caught nothing it quotes the query and leads to changing it", async () => {
    const user = userEvent.setup()
    mockApi.use(apiHandlers.contacts([aContact({ name: "Anna Kowalska" })]))

    const { currentUrl } = renderApp("/kontakty")

    await user.type(await screen.findByRole("searchbox"), "ślusarz")

    expect(await screen.findByText("Nic nie pasuje do „ślusarz”")).toBeDefined()
    expect(screen.queryByText("Nie masz jeszcze żadnego kontaktu")).toBeNull()

    await user.click(screen.getByRole("button", { name: "Pokaż wszystkie kontakty" }))
    expect(currentUrl()).toBe("/kontakty")
    expect(await screen.findByRole("row", { name: /Anna Kowalska/ })).toBeDefined()
  })

  test("a connection error talks about the connection, not about having no contacts", async () => {
    mockApi.use(apiHandlers.contactsUnreachable())

    renderApp("/kontakty")

    const message = await screen.findByRole("alert")
    expect(within(message).getByText("Nie udało się wczytać kontaktów")).toBeDefined()
    expect(
      within(message).getByText(
        "Wygląda na problem z połączeniem. Sprawdź sieć i spróbuj ponownie."
      )
    ).toBeDefined()
    expect(screen.queryByText("Nie masz jeszcze żadnego kontaktu")).toBeNull()
  })

  test("after an error one can retry without refreshing the page", async () => {
    const user = userEvent.setup()
    mockApi.use(apiHandlers.contactsUnreachable())

    renderApp("/kontakty")

    await screen.findByRole("alert")

    mockApi.use(apiHandlers.contacts([aContact({ name: "Anna Kowalska" })]))
    await user.click(screen.getByRole("button", { name: "Spróbuj ponownie" }))

    expect(await screen.findByRole("row", { name: /Anna Kowalska/ })).toBeDefined()
  })
})
