import { describe, expect, test } from "bun:test"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { aContact, contactsApi, mockApi, renderApp } from "../../../__tests__/harness"

const openForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole("button", { name: "Nowy kontakt" }))

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
    await user.type(screen.getByRole("combobox", { name: "Specjalizacja" }), values.role)
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

describe("adding a contact", () => {
  test("adds a contact and shows it in the right place in the list", async () => {
    const user = userEvent.setup()
    const api = contactsApi([aContact({ name: "Zofia Wilk", role: "Sprzątanie" })])
    mockApi.use(...api.handlers)

    renderApp("/kontakty")

    await openForm(user)
    await fill(user, { name: "Anna Kowalska", role: "Księgowa", phone: "600100200" })
    await user.click(screen.getByRole("button", { name: "Dodaj kontakt" }))

    expect(await screen.findByText("Dodano Anna Kowalska")).toBeDefined()
    await waitFor(() => {
      expect(visibleNames()).toEqual(["Anna Kowalska", "Zofia Wilk"])
    })
  })

  test("normalises the number on save — nine digits go to the API", async () => {
    const user = userEvent.setup()
    const api = contactsApi()
    mockApi.use(...api.handlers)

    renderApp("/kontakty")

    await openForm(user)
    await fill(user, { name: "Marek Nowak", role: "Hydraulik", phone: "+48 602-118-447" })
    await user.click(screen.getByRole("button", { name: "Dodaj kontakt" }))

    await waitFor(() => {
      expect(api.requests.filter((request) => request.method === "POST")).toHaveLength(1)
    })
    expect(api.requests[0]?.body.phone).toBe("602118447")
  })

  test("does not shout while typing — the error appears only after the field is left", async () => {
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

  test("rejects a wrong-length number and says so at the number field", async () => {
    const user = userEvent.setup()
    const api = contactsApi()
    mockApi.use(...api.handlers)

    renderApp("/kontakty")

    await openForm(user)
    await fill(user, { name: "Marek Nowak", role: "Hydraulik", phone: "602 118" })
    await user.click(screen.getByRole("button", { name: "Dodaj kontakt" }))

    expect(await screen.findByText("Numer musi mieć 9 cyfr")).toBeDefined()
    expect(api.requests).toHaveLength(0)
  })

  test("Escape closes the dialog and returns focus to the button that opened it", async () => {
    const user = userEvent.setup()
    mockApi.use(...contactsApi().handlers)

    renderApp("/kontakty")

    const trigger = await screen.findByRole("button", { name: "Nowy kontakt" })
    await user.click(trigger)
    await screen.findByRole("dialog")

    await user.keyboard("{Escape}")

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull()
    })
    /* Compared by text rather than by node — a failed assertion on a DOM
       element prints the whole happy-dom tree and destroys readability. */
    await waitFor(() => {
      expect(document.activeElement?.textContent).toBe(trigger.textContent)
    })
  })

  test("keeps focus inside the dialog — Tab does not lead out to the background", async () => {
    const user = userEvent.setup()
    mockApi.use(...contactsApi([aContact()]).handlers)

    renderApp("/kontakty")

    const dialog = await openForm(user)

    /* Walking the whole dialog with Tab has to leave focus inside. */
    const escaped: Array<number> = []
    for (let step = 0; step < 8; step += 1) {
      await user.tab()
      if (!dialog.contains(document.activeElement)) escaped.push(step)
    }

    expect(escaped).toEqual([])
  })
})

describe("specialisation suggestions", () => {
  const roleField = () => screen.getByRole("combobox", { name: "Specjalizacja" })

  test("picking a suggestion fills the field", async () => {
    const user = userEvent.setup()
    mockApi.use(...contactsApi().handlers)

    renderApp("/kontakty")

    await openForm(user)
    await user.click(roleField())
    await user.click(await screen.findByRole("option", { name: "Kominiarz" }))

    expect((roleField() as HTMLInputElement).value).toBe("Kominiarz")
    /* The pick closes the list — it is not a menu to keep browsing. */
    await waitFor(() => {
      expect(screen.queryByRole("option", { name: "Kominiarz" })).toBeNull()
    })
  })

  test("typing narrows the list to what matches", async () => {
    const user = userEvent.setup()
    mockApi.use(...contactsApi().handlers)

    renderApp("/kontakty")

    await openForm(user)
    await user.type(roleField(), "ek")

    await waitFor(() => {
      expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
        "Elektryk",
        "Dekarz"
      ])
    })
  })

  test("the field stays free text — a specialisation outside the list saves", async () => {
    const user = userEvent.setup()
    const api = contactsApi()
    mockApi.use(...api.handlers)

    renderApp("/kontakty")

    await openForm(user)
    await fill(user, { name: "Anna Kowalska", role: "Księgowa", phone: "600100200" })
    await user.click(screen.getByRole("button", { name: "Dodaj kontakt" }))

    await waitFor(() => {
      expect(api.requests.filter((request) => request.method === "POST")).toHaveLength(1)
    })
    expect(api.requests[0]?.body.role).toBe("Księgowa")
  })

  test("Escape shuts the list first and leaves the dialog open", async () => {
    const user = userEvent.setup()
    mockApi.use(...contactsApi().handlers)

    renderApp("/kontakty")

    await openForm(user)
    await user.click(roleField())
    expect(await screen.findByRole("option", { name: "Hydraulik" })).toBeDefined()

    await user.keyboard("{Escape}")

    await waitFor(() => {
      expect(screen.queryByRole("option")).toBeNull()
    })
    expect(screen.getByRole("dialog")).toBeDefined()
  })
})

describe("an error response from the server", () => {
  test("server-side validation lands at the field it concerns", async () => {
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
    await user.click(screen.getByRole("button", { name: "Dodaj kontakt" }))

    expect(await screen.findByText("Specjalizacja odrzucona")).toBeDefined()
  })

  test("a missing contact closes the form and says the list was stale", async () => {
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

describe("the duplicate-number warning", () => {
  test("says who already owns the number, and does not block the save", async () => {
    const user = userEvent.setup()
    const api = contactsApi([
      aContact({ name: "Grzegorz Sobczak", role: "Złota rączka", phone: "602118447" })
    ])
    mockApi.use(...api.handlers)

    renderApp("/kontakty")

    await openForm(user)
    /* A different notation of the same number — the comparison runs on the normalised value. */
    await fill(user, { name: "Marek Nowak", role: "Hydraulik", phone: "+48 602 118 447" })

    expect(
      await screen.findByText("Ten numer masz już jako Grzegorz Sobczak — Złota rączka")
    ).toBeDefined()

    await user.click(screen.getByRole("button", { name: "Dodaj kontakt" }))

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

describe("editing a contact", () => {
  test("opens the form with the current data and saves the change into the list", async () => {
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

    const role = screen.getByRole("combobox", { name: "Specjalizacja" })
    await user.clear(role)
    await user.type(role, "Elektryk")
    await user.click(screen.getByRole("button", { name: "Zapisz zmiany" }))

    expect(await screen.findByText("Zapisano zmiany — Marek Nowak")).toBeDefined()
    expect(await screen.findByText("Elektryk")).toBeDefined()
  })

  test("once the dialog closes, focus returns to the row menu it was opened from", async () => {
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

  test("the row menu closes on a click beside it", async () => {
    /*
     * An open menu sets `pointer-events: none` on the document so the
     * background is unclickable — and that is exactly the behaviour under test,
     * so the check on that property in the simulated click has to give way.
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

describe("deleting a contact", () => {
  const openDelete = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(await screen.findByRole("button", { name: /Akcje kontaktu/ }))
    await user.click(await screen.findByRole("menuitem", { name: "Usuń" }))

    return screen.findByRole("alertdialog")
  }

  test("asks for confirmation carrying the name and role of the contact being deleted", async () => {
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

  test("undoing a deletion restores the contact as a new entry", async () => {
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

    /* The same content, a new identity — this is a create, not a reversal (ADR-0003). */
    const [restored] = api.current()
    expect(restored?.id).not.toBe(original?.id)
  })
})
