import { describe, expect, test } from "bun:test"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { aContact, apiHandlers, mockApi, renderApp } from "../../../__tests__/harness"

/**
 * Nazwiska w kolejności, w jakiej stoją na ekranie — bez wiersza nagłówka.
 * Idzie po rolach, nie po znacznikach, więc przebudowa tabeli nie psuje testu,
 * dopóki wiersze i komórki zostają wierszami i komórkami.
 */
const visibleNames = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0]?.textContent)

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
    expect(within(anna).getByText("600 100 200")).toBeDefined()

    const marek = screen.getByRole("row", { name: /Marek Nowak/ })
    expect(within(marek).getByText("Hydraulik")).toBeDefined()
    expect(within(marek).getByText("512 345 678")).toBeDefined()
  })

  test("opisuje kolumny nagłówkami, po których poznaje się zawartość", async () => {
    mockApi.use(apiHandlers.contacts([aContact()]))

    renderApp("/kontakty")

    await screen.findByRole("row", { name: /Grzegorz Sobczak/ })

    // Trzy kolumny z danymi nazywają się przyciskiem, bo poza nazwaniem sortują.
    for (const label of ["Imię i nazwisko", "Specjalizacja", "Telefon"]) {
      expect(screen.getByRole("button", { name: label })).toBeDefined()
    }
    expect(screen.getAllByRole("columnheader")).toHaveLength(4)
  })
})

describe("numer telefonu", () => {
  test("pokazuje numer z odstępami, żeby dało się go przepisać bez pomyłki", async () => {
    mockApi.use(apiHandlers.contacts([aContact({ phone: "602118447" })]))

    renderApp("/kontakty")

    expect(await screen.findByText("602 118 447")).toBeDefined()
  })

  test("numer jest do wybrania jednym kliknięciem", async () => {
    mockApi.use(apiHandlers.contacts([aContact({ phone: "602118447" })]))

    renderApp("/kontakty")

    const call = await screen.findByRole("link", { name: "Zadzwoń pod numer 602 118 447" })
    expect(call.getAttribute("href")).toBe("tel:+48602118447")
  })

  test("kopiuje numer w czytelnym formacie i potwierdza, że trafił do schowka", async () => {
    const user = userEvent.setup()
    mockApi.use(apiHandlers.contacts([aContact({ phone: "602118447" })]))

    renderApp("/kontakty")

    await user.click(await screen.findByRole("button", { name: /Akcje kontaktu/ }))
    await user.click(await screen.findByRole("menuitem", { name: "Kopiuj numer" }))

    expect(await navigator.clipboard.readText()).toBe("602 118 447")
    expect(await screen.findByText("Numer skopiowany do schowka")).toBeDefined()
  })
})

describe("licznik kontaktów", () => {
  test("odmienia liczebnik, żeby interfejs nie wyglądał na niedokończony", async () => {
    mockApi.use(apiHandlers.contacts([aContact(), aContact(), aContact()]))

    renderApp("/kontakty")

    expect(await screen.findByText("3 kontakty")).toBeDefined()
  })

  test("przy filtrze pokazuje wynik na tle całości", async () => {
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

describe("sortowanie listy", () => {
  const trio = () => [
    aContact({ name: "Marek Nowak", role: "Hydraulik", phone: "602118447" }),
    aContact({ name: "Anna Kowalska", role: "Złota rączka", phone: "512345678" }),
    aContact({ name: "Łukasz Mazur", role: "Elektryk", phone: "555666777" })
  ]

  test("domyślnie układa listę alfabetycznie po nazwisku, z polskimi znakami na miejscu", async () => {
    mockApi.use(apiHandlers.contacts(trio()))

    renderApp("/kontakty")

    await screen.findByRole("table")
    expect(visibleNames()).toEqual(["Anna Kowalska", "Łukasz Mazur", "Marek Nowak"])
  })

  test("kliknięcie nagłówka sortuje po tej kolumnie, a ponowne odwraca kierunek", async () => {
    const user = userEvent.setup()
    mockApi.use(apiHandlers.contacts(trio()))

    renderApp("/kontakty")

    await user.click(await screen.findByRole("button", { name: /Specjalizacja/ }))
    expect(visibleNames()).toEqual(["Łukasz Mazur", "Marek Nowak", "Anna Kowalska"])

    await user.click(screen.getByRole("button", { name: /Specjalizacja/ }))
    expect(visibleNames()).toEqual(["Anna Kowalska", "Marek Nowak", "Łukasz Mazur"])
  })

  test("sortuje po numerze, żeby podobne wpisy wylądowały obok siebie", async () => {
    const user = userEvent.setup()
    mockApi.use(apiHandlers.contacts(trio()))

    renderApp("/kontakty")

    await user.click(await screen.findByRole("button", { name: /Telefon/ }))

    expect(visibleNames()).toEqual(["Anna Kowalska", "Łukasz Mazur", "Marek Nowak"])
  })

  test("mówi czytnikowi ekranu, po której kolumnie i w którą stronę lista jest ułożona", async () => {
    const user = userEvent.setup()
    mockApi.use(apiHandlers.contacts(trio()))

    renderApp("/kontakty")

    /* Kierunek niesie nagłówek, a nazywa go przycisk w środku — stąd ta para. */
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

describe("wyszukiwanie kontaktu", () => {
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

  test("znajduje po specjalizacji, gdy nazwisko wypadło z głowy", async () => {
    const user = userEvent.setup()
    await search(user, "hydraulik")

    expect(visibleNames()).toEqual(["Marek Nowak"])
  })

  test("znajduje po fragmencie numeru, żeby rozpoznać, kto właśnie dzwonił", async () => {
    const user = userEvent.setup()
    await search(user, "512345")

    expect(visibleNames()).toEqual(["Marek Nowak"])
  })

  test("numer wklejony z odstępami i kierunkowym działa tak samo jak gołe cyfry", async () => {
    const user = userEvent.setup()
    await search(user, "+48 602 118")

    expect(visibleNames()).toEqual(["Ewa Lis"])
  })

  test("nie zwraca uwagi na wielkość liter", async () => {
    const user = userEvent.setup()
    await search(user, "KSIĘGOWA")

    expect(visibleNames()).toEqual(["Anna Kowalska"])
  })

  test("zapytanie da się wyczyścić jednym kliknięciem", async () => {
    const user = userEvent.setup()
    await search(user, "kowalska")

    await user.click(screen.getByRole("button", { name: "Wyczyść wyszukiwanie" }))

    expect(visibleNames()).toHaveLength(3)
    expect(screen.getByRole("searchbox")).toHaveProperty("value", "")
  })

  test("filtruje bez pytania serwera — API nadal nie przyjmuje żadnych parametrów", async () => {
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

describe("filtr i sortowanie w adresie", () => {
  const trio = () => [
    aContact({ name: "Anna Kowalska", role: "Księgowa" }),
    aContact({ name: "Marek Nowak", role: "Hydraulik" }),
    aContact({ name: "Ewa Lis", role: "Elektryk" })
  ]

  test("odtwarza widok z adresu przy wejściu, więc link i odświeżenie działają", async () => {
    mockApi.use(apiHandlers.contacts(trio()))

    renderApp("/kontakty?q=hydraulik")

    await screen.findByRole("table")
    expect(visibleNames()).toEqual(["Marek Nowak"])
    expect(screen.getByRole("searchbox")).toHaveProperty("value", "hydraulik")
  })

  test("odtwarza z adresu także kolumnę i kierunek sortowania", async () => {
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
    // Historia cofa się poza pętlą zdarzeń, więc router odbiera to dopiero teraz.
    await screen.findByDisplayValue("hydraulik")
    expect(visibleNames()).toEqual(["Marek Nowak"])
  })

  test("zapisuje zmianę filtra i sortowania w adresie", async () => {
    const user = userEvent.setup()
    mockApi.use(apiHandlers.contacts(trio()))

    const { currentUrl } = renderApp("/kontakty")

    await user.type(await screen.findByRole("searchbox"), "ksi")
    expect(currentUrl()).toBe("/kontakty?q=ksi")

    await user.click(screen.getByRole("button", { name: /Specjalizacja/ }))
    expect(currentUrl()).toBe("/kontakty?q=ksi&sort=role")
  })

  test("adres ze zmyślonymi parametrami cofa się do widoku domyślnego, zamiast wywalać ekran", async () => {
    mockApi.use(apiHandlers.contacts(trio()))

    renderApp("/kontakty?sort=wiek&dir=w-lewo")

    await screen.findByRole("table")
    expect(visibleNames()).toEqual(["Anna Kowalska", "Ewa Lis", "Marek Nowak"])
  })
})

describe("stany, w których nie ma czego pokazać", () => {
  test("mówi, że wczytuje — pusty ekran nie udaje braku kontaktów", async () => {
    mockApi.use(apiHandlers.contactsPending())

    renderApp("/kontakty")

    expect(await screen.findByText("Wczytuję kontakty…")).toBeDefined()
    expect(screen.queryByRole("table")).toBeNull()
  })

  test("przy pustej bazie zachęca do dodania pierwszego numeru", async () => {
    mockApi.use(apiHandlers.contacts([]))

    renderApp("/kontakty")

    expect(await screen.findByText("Nie masz jeszcze żadnego kontaktu")).toBeDefined()
    expect(
      screen.getByText("Dodaj pierwszy numer, żeby wiedzieć, do kogo dzwonić przy awarii.")
    ).toBeDefined()
    expect(screen.queryByRole("table")).toBeNull()
  })

  test("gdy filtr nic nie złapał, przytacza zapytanie i prowadzi do jego zmiany", async () => {
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

  test("błąd połączenia mówi o połączeniu, a nie o braku kontaktów", async () => {
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

  test("po błędzie da się spróbować ponownie bez odświeżania strony", async () => {
    const user = userEvent.setup()
    mockApi.use(apiHandlers.contactsUnreachable())

    renderApp("/kontakty")

    await screen.findByRole("alert")

    mockApi.use(apiHandlers.contacts([aContact({ name: "Anna Kowalska" })]))
    await user.click(screen.getByRole("button", { name: "Spróbuj ponownie" }))

    expect(await screen.findByRole("row", { name: /Anna Kowalska/ })).toBeDefined()
  })
})
