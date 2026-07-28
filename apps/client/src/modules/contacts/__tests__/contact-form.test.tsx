import { describe, expect, test } from "bun:test"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { aContact, contactsApi, mockApi, renderApp } from "../../../__tests__/harness"

const openForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole("button", { name: "Dodaj kontakt" }))

  return screen.findByRole("dialog")
}

const fill = async (
  user: ReturnType<typeof userEvent.setup>,
  values: { name?: string; role?: string; phone?: string }
) => {
  if (values.name !== undefined) {
    await user.type(screen.getByRole("textbox", { name: "Imię i nazwisko" }), values.name)
  }
  if (values.role !== undefined) {
    await user.type(screen.getByRole("textbox", { name: "Specjalizacja" }), values.role)
  }
  if (values.phone !== undefined) {
    await user.type(screen.getByRole("textbox", { name: "Telefon" }), values.phone)
  }
}

const visibleNames = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0]?.textContent)

describe("dodawanie kontaktu", () => {
  test("dodaje kontakt i pokazuje go na liście we właściwym miejscu", async () => {
    const user = userEvent.setup()
    const api = contactsApi([aContact({ name: "Zofia Wilk", role: "Sprzątanie" })])
    mockApi.use(...api.handlers)

    renderApp("/kontakty")

    await openForm(user)
    await fill(user, { name: "Anna Kowalska", role: "Księgowa", phone: "600100200" })
    await user.click(screen.getByRole("button", { name: "Dodaj kontakt", hidden: false }))

    expect(await screen.findByText("Dodano Anna Kowalska")).toBeDefined()
    await waitFor(() => {
      expect(visibleNames()).toEqual(["Anna Kowalska", "Zofia Wilk"])
    })
  })

  test("normalizuje numer przy zapisie — do API idzie dziewięć cyfr", async () => {
    const user = userEvent.setup()
    const api = contactsApi()
    mockApi.use(...api.handlers)

    renderApp("/kontakty")

    await openForm(user)
    await fill(user, { name: "Marek Nowak", role: "Hydraulik", phone: "+48 602-118-447" })
    await user.click(screen.getByRole("button", { name: "Dodaj kontakt", hidden: false }))

    await waitFor(() => {
      expect(api.requests.filter((request) => request.method === "POST")).toHaveLength(1)
    })
    expect(api.requests[0]?.body.phone).toBe("602118447")
  })

  test("nie krzyczy w trakcie pisania — błąd pojawia się dopiero po opuszczeniu pola", async () => {
    const user = userEvent.setup()
    mockApi.use(...contactsApi().handlers)

    renderApp("/kontakty")

    await openForm(user)
    const name = screen.getByRole("textbox", { name: "Imię i nazwisko" })
    await user.type(name, "A")
    await user.clear(name)

    expect(screen.queryByText("Podaj imię i nazwisko")).toBeNull()

    await user.tab()

    expect(await screen.findByText("Podaj imię i nazwisko")).toBeDefined()
  })

  test("odrzuca numer o złej długości i mówi to przy polu numeru", async () => {
    const user = userEvent.setup()
    const api = contactsApi()
    mockApi.use(...api.handlers)

    renderApp("/kontakty")

    await openForm(user)
    await fill(user, { name: "Marek Nowak", role: "Hydraulik", phone: "602 118" })
    await user.click(screen.getByRole("button", { name: "Dodaj kontakt", hidden: false }))

    expect(await screen.findByText("Numer musi mieć 9 cyfr")).toBeDefined()
    expect(api.requests).toHaveLength(0)
  })

  test("Escape zamyka okno i oddaje fokus przyciskowi, który je otworzył", async () => {
    const user = userEvent.setup()
    mockApi.use(...contactsApi().handlers)

    renderApp("/kontakty")

    const trigger = await screen.findByRole("button", { name: "Dodaj kontakt" })
    await user.click(trigger)
    await screen.findByRole("dialog")

    await user.keyboard("{Escape}")

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull()
    })
    /* Porównanie po tekście, nie po węźle — nieudana asercja na elemencie DOM-u
       wypisuje całe drzewo happy-doma i zabija czytelność wyniku. */
    await waitFor(() => {
      expect(document.activeElement?.textContent).toBe(trigger.textContent)
    })
  })

  test("trzyma fokus w oknie — Tab nie wyprowadza w tło", async () => {
    const user = userEvent.setup()
    mockApi.use(...contactsApi([aContact()]).handlers)

    renderApp("/kontakty")

    const dialog = await openForm(user)

    /* Obejście całego okna klawiszem Tab musi zostawić fokus w środku. */
    const escaped: Array<number> = []
    for (let step = 0; step < 8; step += 1) {
      await user.tab()
      if (!dialog.contains(document.activeElement)) escaped.push(step)
    }

    expect(escaped).toEqual([])
  })
})

describe("odpowiedź błędna z serwera", () => {
  test("walidacja z serwera ląduje przy polu, którego dotyczy", async () => {
    const user = userEvent.setup()
    mockApi.use(
      ...contactsApi([], {
        status: 400,
        body: {
          _tag: "HttpApiDecodeError",
          issues: [{ _tag: "Type", path: ["role"], message: "Specjalizacja odrzucona" }]
        }
      }).handlers
    )

    renderApp("/kontakty")

    await openForm(user)
    await fill(user, { name: "Marek Nowak", role: "Hydraulik", phone: "602118447" })
    await user.click(screen.getByRole("button", { name: "Dodaj kontakt", hidden: false }))

    expect(await screen.findByText("Specjalizacja odrzucona")).toBeDefined()
  })

  test("nieodnaleziony kontakt zamyka formularz i mówi, że lista była nieaktualna", async () => {
    const user = userEvent.setup()
    mockApi.use(
      ...contactsApi([aContact({ name: "Marek Nowak" })], {
        status: 404,
        body: { _tag: "ContactNotFound", id: "nieistotne" }
      }).handlers
    )

    renderApp("/kontakty")

    await user.click(await screen.findByRole("button", { name: /Akcje kontaktu/ }))
    await user.click(await screen.findByRole("menuitem", { name: "Edytuj" }))
    await screen.findByRole("dialog")
    await user.click(screen.getByRole("button", { name: "Zapisz zmiany" }))

    expect(await screen.findByText("Tego kontaktu już nie ma — odświeżam listę")).toBeDefined()
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull()
    })
  })
})

describe("ostrzeżenie o duplikacie numeru", () => {
  test("mówi, do kogo numer już należy, i nie blokuje zapisu", async () => {
    const user = userEvent.setup()
    const api = contactsApi([
      aContact({ name: "Grzegorz Sobczak", role: "Złota rączka", phone: "602118447" })
    ])
    mockApi.use(...api.handlers)

    renderApp("/kontakty")

    await openForm(user)
    /* Inny zapis tego samego numeru — porównanie idzie po wartości znormalizowanej. */
    await fill(user, { name: "Marek Nowak", role: "Hydraulik", phone: "+48 602 118 447" })

    expect(
      await screen.findByText("Ten numer masz już jako Grzegorz Sobczak — Złota rączka")
    ).toBeDefined()

    await user.click(screen.getByRole("button", { name: "Dodaj kontakt", hidden: false }))

    expect(await screen.findByText("Dodano Marek Nowak")).toBeDefined()
  })

  test("przy edycji kontakt nie ostrzega sam o sobie", async () => {
    const user = userEvent.setup()
    mockApi.use(
      ...contactsApi([
        aContact({ name: "Grzegorz Sobczak", role: "Złota rączka", phone: "602118447" })
      ]).handlers
    )

    renderApp("/kontakty")

    await user.click(await screen.findByRole("button", { name: /Akcje kontaktu/ }))
    await user.click(await screen.findByRole("menuitem", { name: "Edytuj" }))
    await screen.findByRole("dialog")

    expect(screen.queryByText(/Ten numer masz już jako/)).toBeNull()
  })
})

describe("edycja kontaktu", () => {
  test("otwiera formularz z obecnymi danymi i zapisuje zmianę na liście", async () => {
    const user = userEvent.setup()
    const api = contactsApi([
      aContact({ name: "Marek Nowak", role: "Hydraulik", phone: "602118447" })
    ])
    mockApi.use(...api.handlers)

    renderApp("/kontakty")

    await user.click(await screen.findByRole("button", { name: /Akcje kontaktu/ }))
    await user.click(await screen.findByRole("menuitem", { name: "Edytuj" }))

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByRole("heading", { name: "Edycja kontaktu" })).toBeDefined()
    expect(
      (screen.getByRole("textbox", { name: "Imię i nazwisko" }) as HTMLInputElement).value
    ).toBe("Marek Nowak")

    const role = screen.getByRole("textbox", { name: "Specjalizacja" })
    await user.clear(role)
    await user.type(role, "Elektryk")
    await user.click(screen.getByRole("button", { name: "Zapisz zmiany" }))

    expect(await screen.findByText("Zapisano zmiany — Marek Nowak")).toBeDefined()
    expect(await screen.findByText("Elektryk")).toBeDefined()
  })

  test("po zamknięciu okna fokus wraca na menu wiersza, z którego je otwarto", async () => {
    const user = userEvent.setup()
    mockApi.use(...contactsApi([aContact({ name: "Marek Nowak" })]).handlers)

    renderApp("/kontakty")

    const menu = await screen.findByRole("button", { name: "Akcje kontaktu Marek Nowak" })
    await user.click(menu)
    await user.click(await screen.findByRole("menuitem", { name: "Edytuj" }))
    await screen.findByRole("dialog")

    await user.keyboard("{Escape}")

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull()
    })
    await waitFor(() => {
      expect(document.activeElement?.getAttribute("aria-label")).toBe(
        "Akcje kontaktu Marek Nowak"
      )
    })
  })

  test("menu wiersza zamyka się kliknięciem obok", async () => {
    /*
     * Otwarte menu ustawia `pointer-events: none` na dokumencie, żeby tło było
     * nieklikalne — a to jest właśnie badane zachowanie, więc kontrola tej
     * własności w symulowanym kliknięciu musi ustąpić.
     */
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    mockApi.use(...contactsApi([aContact()]).handlers)

    renderApp("/kontakty")

    await user.click(await screen.findByRole("button", { name: /Akcje kontaktu/ }))
    expect(await screen.findByRole("menuitem", { name: "Edytuj" })).toBeDefined()

    await user.click(document.body)

    await waitFor(() => {
      expect(screen.queryByRole("menuitem", { name: "Edytuj" })).toBeNull()
    })
  })
})

describe("usuwanie kontaktu", () => {
  const openDelete = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(await screen.findByRole("button", { name: /Akcje kontaktu/ }))
    await user.click(await screen.findByRole("menuitem", { name: "Usuń" }))

    return screen.findByRole("alertdialog")
  }

  test("pyta o potwierdzenie z nazwiskiem i specjalizacją usuwanego kontaktu", async () => {
    const user = userEvent.setup()
    mockApi.use(
      ...contactsApi([aContact({ name: "Marek Nowak", role: "Hydraulik" })]).handlers
    )

    renderApp("/kontakty")

    const dialog = await openDelete(user)

    expect(within(dialog).getByText(/Marek Nowak — Hydraulik/)).toBeDefined()
  })

  test("usuwa kontakt z listy po potwierdzeniu i potwierdza to powiadomieniem", async () => {
    const user = userEvent.setup()
    const api = contactsApi([
      aContact({ name: "Marek Nowak", role: "Hydraulik" }),
      aContact({ name: "Zofia Wilk", role: "Sprzątanie" })
    ])
    mockApi.use(...api.handlers)

    renderApp("/kontakty")

    await user.click(
      await screen.findByRole("button", { name: "Akcje kontaktu Marek Nowak" })
    )
    await user.click(await screen.findByRole("menuitem", { name: "Usuń" }))
    await screen.findByRole("alertdialog")
    await user.click(screen.getByRole("button", { name: "Usuń kontakt" }))

    expect(await screen.findByText("Usunięto Marek Nowak")).toBeDefined()
    await waitFor(() => {
      expect(visibleNames()).toEqual(["Zofia Wilk"])
    })
  })

  test("cofnięcie usunięcia przywraca kontakt jako nowy wpis", async () => {
    const user = userEvent.setup()
    const api = contactsApi([aContact({ name: "Marek Nowak", role: "Hydraulik" })])
    mockApi.use(...api.handlers)

    renderApp("/kontakty")

    const [original] = api.current()

    await openDelete(user)
    await user.click(screen.getByRole("button", { name: "Usuń kontakt" }))
    await user.click(await screen.findByRole("button", { name: "Cofnij" }))

    expect(await screen.findByText("Przywrócono Marek Nowak")).toBeDefined()
    await waitFor(() => {
      expect(visibleNames()).toEqual(["Marek Nowak"])
    })

    /* Ta sama treść, nowa tożsamość — to utworzenie, nie odwrócenie (ADR-0003). */
    const [restored] = api.current()
    expect(restored?.id).not.toBe(original?.id)
  })
})
