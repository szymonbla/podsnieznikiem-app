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
    copy: "Kopiuj numer ",
    copied: "Numer skopiowany do schowka",
    copyFailed: "Nie udało się skopiować numeru"
  },
  loading: "Wczytuję kontakty…",
  emptyList: {
    title: "Nie masz jeszcze żadnego kontaktu",
    // Przycisk prowadzący do dodania dokłada ticket 07 — `EmptyState` ma na niego `action`.
    description: "Dodaj pierwszy numer, żeby wiedzieć, do kogo dzwonić przy awarii."
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
