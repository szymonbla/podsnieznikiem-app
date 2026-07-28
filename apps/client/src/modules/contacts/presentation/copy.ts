/**
 * Wszystkie teksty ekranu w jednym miejscu — JSX ich nie zawiera.
 * i18n świadomie pominięte: interfejs jest po polsku (DESIGN.md §3).
 */
export const contactsCopy = {
  title: "Kontakty",
  columns: {
    name: "Imię i nazwisko",
    role: "Specjalizacja",
    phone: "Telefon",
    /** Kolumna akcji nie ma widocznego nagłówka, ale czytnik ekranu musi ją nazwać. */
    actions: "Akcje"
  },
  search: {
    label: "Szukaj kontaktu",
    placeholder: "Nazwisko, fach albo numer",
    clear: "Wyczyść wyszukiwanie"
  },
  row: {
    call: "Zadzwoń pod numer ",
    copied: "Numer skopiowany do schowka",
    copyFailed: "Nie udało się skopiować numeru",
    /** Menu nazwane nazwiskiem — na liście jest ich tyle, ile wierszy. */
    menu: (name: string) => `Akcje kontaktu ${name}`,
    /** Pozycja menu — bez numeru, bo ten stoi w tym samym wierszu. */
    copyItem: "Kopiuj numer",
    edit: "Edytuj",
    remove: "Usuń"
  },

  add: "Dodaj kontakt",

  form: {
    create: {
      title: "Nowy kontakt",
      description: "Imię i nazwisko, fach i numer — tyle wystarczy.",
      submit: "Dodaj kontakt",
      /** Potwierdzenie z nazwiskiem, żeby nie było wątpliwości, co się zapisało. */
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
     * Ostrzeżenie, nie błąd — zapis przechodzi. Osoba wykonująca dwa fachy to
     * dwa kontakty dzielące numer (ticket 08).
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
    /** Nie sugeruje, że kontakt wrócił — bo nie wrócił (ticket 10). */
    restoreFailed: "Nie udało się przywrócić kontaktu"
  },

  /** Lista jest nieaktualna, więc zostanie unieważniona — właściciel ma o tym wiedzieć. */
  notFound: "Tego kontaktu już nie ma — odświeżam listę",
  loading: "Wczytuję kontakty…",
  emptyList: {
    title: "Nie masz jeszcze żadnego kontaktu",
    description: "Dodaj pierwszy numer, żeby wiedzieć, do kogo dzwonić przy awarii.",
    action: "Dodaj pierwszy kontakt"
  },
  emptySearch: {
    /** Zapytanie przytoczone, żeby właściciel zobaczył, czego faktycznie szukał. */
    title: (query: string) => `Nic nie pasuje do „${query}”`,
    description: "Spróbuj krótszego fragmentu nazwiska, fachu albo numeru.",
    /** Inna nazwa niż krzyżyk w polu, żeby dwa wyjścia z filtra dały się rozróżnić. */
    action: "Pokaż wszystkie kontakty"
  },
  loadError: {
    title: "Nie udało się wczytać kontaktów",
    description: "Wygląda na problem z połączeniem. Sprawdź sieć i spróbuj ponownie.",
    action: "Spróbuj ponownie"
  }
} as const

/**
 * Polska odmiana liczebnika: 1 → *kontakt*, końcówki 2–4 → *kontakty*, reszta →
 * *kontaktów*. Wyjątek na 12–14, bo „12 kontakty" brzmi jak niedokończony
 * interfejs (spec 0001, historia 4).
 */
export const contactsCount = (count: number): string => {
  const lastTwo = count % 100
  const last = count % 10

  if (count === 1) return `${count} kontakt`
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return `${count} kontakty`

  return `${count} kontaktów`
}

/**
 * Przy filtrze liczy się wynik na tle całości, nie sama liczba trafień —
 * `3 z 24`, dosłownie jak w DESIGN.md §9. Rzeczownik zostaje pominięty
 * świadomie: po „z" musiałby stanąć w dopełniaczu („z 24 kontaktów"), więc
 * licznik odmieniałby się inaczej niż przy pełnej liście i wyglądałby na
 * niekonsekwentny.
 */
export const contactsMatchCount = (shown: number, total: number): string => `${shown} z ${total}`
