/**
 * All the screen's text in one place — the JSX contains none of it. i18n is
 * deliberately left out: the interface is Polish (DESIGN.md §3), so the values
 * here stay Polish while the code around them does not.
 */
export const contactsCopy = {
  title: "Kontakty",
  /** The name of the table and its scroll region — a screen reader enters the list with context. */
  tableLabel: "Lista kontaktów",
  columns: {
    name: "Imię i nazwisko",
    role: "Specjalizacja",
    phone: "Telefon",
    /** The actions column has no visible heading, but a screen reader must name it. */
    actions: "Akcje"
  },
  search: {
    label: "Szukaj kontaktu",
    placeholder: "Nazwisko, fach albo numer",
    clear: "Wyczyść wyszukiwanie",
    /** A hint for the field: the filter works as you type, so say where the result lands. */
    hint: "Lista filtruje się w trakcie pisania."
  },
  row: {
    call: "Zadzwoń pod numer ",
    copied: "Numer skopiowany do schowka",
    copyFailed: "Nie udało się skopiować numeru",
    /** The menu is named by the person — there are as many as there are rows. */
    menu: (name: string) => `Akcje kontaktu ${name}`,
    /** A menu item — without the number, which sits in the same row. */
    copyItem: "Kopiuj numer",
    edit: "Edytuj",
    remove: "Usuń"
  },

  add: "Nowy kontakt",

  /**
   * The note under the list. There is no "save" button outside the dialog, so
   * the owner has to learn somewhere that nothing will be lost.
   */
  autosave: "Zmiany zapisują się automatycznie.",

  form: {
    create: {
      title: "Nowy kontakt",
      description: "Imię i nazwisko, fach i numer — tyle wystarczy.",
      submit: "Dodaj kontakt",
      /** A confirmation carrying the name, so there is no doubt what was saved. */
      success: (name: string) => `Dodano ${name}`,
      failure: "Nie udało się dodać kontaktu"
    },
    edit: {
      title: "Edycja kontaktu",
      description: "Popraw to, co się zmieniło — reszta zostaje bez zmian.",
      submit: "Zapisz zmiany",
      success: (name: string) => `Zapisano zmiany — ${name}`,
      failure: "Nie udało się zapisać zmian"
    },
    fields: {
      name: "Imię i nazwisko",
      role: "Specjalizacja",
      phone: "Telefon"
    },
    placeholders: {
      name: "Grzegorz Sobczak",
      role: "Złota rączka",
      phone: "602 118 447"
    },
    cancel: "Anuluj",
    /**
     * The design's role suggestions. This is a `datalist`, not a closed list —
     * the trades around a cottage do not stop at seven, and the field stays
     * free text.
     */
    roleSuggestions: [
      "Hydraulik",
      "Elektryk",
      "Dekarz",
      "Kominiarz",
      "Złota rączka",
      "Serwis AGD",
      "Sprzątanie"
    ],
    /**
     * A warning, not an error — the save goes through. A person working two
     * trades is two contacts sharing a number (ticket 08).
     */
    duplicate: (name: string, role: string) => `Ten numer masz już jako ${name} — ${role}`
  },

  remove: {
    title: "Usunąć kontakt?",
    description: (name: string, role: string) =>
      `${name} — ${role} zniknie z listy. Usunięcie jest trwałe, ale przez chwilę da się je cofnąć.`,
    confirm: "Usuń kontakt",
    cancel: "Zostaw",
    success: (name: string) => `Usunięto ${name}`,
    failure: "Nie udało się usunąć kontaktu",
    undo: "Cofnij",
    restored: (name: string) => `Przywrócono ${name}`,
    /** Does not imply the contact came back — because it did not (ticket 10). */
    restoreFailed: "Nie udało się przywrócić kontaktu"
  },

  /** The list is stale and will be invalidated — the owner should know. */
  notFound: "Tego kontaktu już nie ma — odświeżam listę",
  loading: "Wczytuję kontakty…",
  emptyList: {
    title: "Nie masz jeszcze żadnego kontaktu",
    description: "Dodaj pierwszy numer, żeby wiedzieć, do kogo dzwonić przy awarii.",
    action: "Dodaj pierwszy kontakt"
  },
  emptySearch: {
    /** The query is quoted back, so the owner sees what they actually searched for. */
    title: (query: string) => `Nic nie pasuje do „${query}”`,
    description: "Spróbuj krótszego fragmentu nazwiska, fachu albo numeru.",
    /** Named differently from the field's cross, so the two ways out of the filter are told apart. */
    action: "Pokaż wszystkie kontakty"
  },
  loadError: {
    title: "Nie udało się wczytać kontaktów",
    description: "Wygląda na problem z połączeniem. Sprawdź sieć i spróbuj ponownie.",
    action: "Spróbuj ponownie"
  }
} as const

/**
 * Polish numeral inflection: 1 -> *kontakt*, endings 2-4 -> *kontakty*, the
 * rest -> *kontaktów*. 12-14 are the exception, because "12 kontakty" sounds
 * like an unfinished interface (spec 0001, story 4).
 */
export const contactsCount = (count: number): string => {
  const lastTwo = count % 100
  const last = count % 10

  if (count === 1) return `${count} kontakt`
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return `${count} kontakty`

  return `${count} kontaktów`
}

/**
 * Under a filter what counts is the result against the whole, not the number of
 * hits alone — `3 z 24`, literally as in DESIGN.md §9. The noun is dropped on
 * purpose: after "z" it would have to be genitive ("z 24 kontaktów"), so the
 * counter would inflect differently than for the full list and would look
 * inconsistent.
 */
export const contactsMatchCount = (shown: number, total: number): string => `${shown} z ${total}`
