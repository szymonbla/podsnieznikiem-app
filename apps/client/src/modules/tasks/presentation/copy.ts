import { INTERVAL_UNITS, RECURRENCE_TYPES } from "../configuration/schema"
import type { Recurrence } from "../domain/models"

const WEEKDAY_NAMES: Readonly<Record<number, string>> = {
  1: "poniedziałek", 2: "wtorek", 3: "środa", 4: "czwartek", 5: "piątek", 6: "sobota", 7: "niedziela"
}
const MONTH_NAMES_NOMINATIVE: Readonly<Record<number, string>> = {
  1: "Styczeń", 2: "Luty", 3: "Marzec", 4: "Kwiecień", 5: "Maj", 6: "Czerwiec",
  7: "Lipiec", 8: "Sierpień", 9: "Wrzesień", 10: "Październik", 11: "Listopad", 12: "Grudzień"
}
const MONTH_NAMES_GENITIVE: Readonly<Record<number, string>> = {
  1: "stycznia", 2: "lutego", 3: "marca", 4: "kwietnia", 5: "maja", 6: "czerwca",
  7: "lipca", 8: "sierpnia", 9: "września", 10: "października", 11: "listopada", 12: "grudnia"
}

export const formatDueDate = (iso: string): string => {
  const [year, month, day] = iso.split("-")
  return `${day}.${month}.${year}`
}

/** 1 -> singular, 2-4 -> few, else -> many; 12-14 always take "many" (same rule as Kontakty's numeral inflection). */
const polishCount = (count: number, forms: { one: string; few: string; many: string }): string => {
  const lastTwo = count % 100
  const last = count % 10
  if (count === 1) return forms.one
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return forms.few
  return forms.many
}

export const intervalUnitLabel = (count: number, unit: Recurrence extends { intervalUnit: infer U } ? U : never): string => {
  switch (unit) {
    case "days": return polishCount(count, { one: "dzień", few: "dni", many: "dni" })
    case "weeks": return polishCount(count, { one: "tydzień", few: "tygodnie", many: "tygodni" })
    case "months": return polishCount(count, { one: "miesiąc", few: "miesiące", many: "miesięcy" })
    default: return ""
  }
}

export const recurrenceSummary = (recurrence: Recurrence): string => {
  switch (recurrence.type) {
    case "once": return `Raz — ${formatDueDate(recurrence.date)}`
    case "weekly": return `Co tydzień — ${WEEKDAY_NAMES[recurrence.weekday]}`
    case "monthly": return `Co miesiąc — ${recurrence.dayOfMonth}. dnia`
    case "yearly": return `Co rok — ${recurrence.day} ${MONTH_NAMES_GENITIVE[recurrence.month]}`
    case "custom":
      return `Co ${recurrence.intervalValue} ${intervalUnitLabel(recurrence.intervalValue, recurrence.intervalUnit)}`
  }
}

export const tasksCopy = {
  title: "Zadania",
  tableLabel: "Lista zadań",
  columns: { description: "Opis", dueDate: "Termin", recurrence: "Cykliczność", actions: "Akcje" },
  overdue: "Zaległe",
  add: "Nowe zadanie",
  autosave: "Zmiany zapisują się automatycznie.",
  row: {
    menu: (description: string) => `Akcje zadania ${description}`,
    complete: "Oznacz jako zrobione",
    edit: "Edytuj",
    remove: "Usuń",
    completed: (description: string) => `Oznaczono jako zrobione: ${description}`,
    completeFailed: "Nie udało się oznaczyć zadania jako zrobione",
    undo: "Cofnij",
    uncompleted: (description: string) => `Cofnięto oznaczenie — ${description}`,
    uncompleteFailed: "Nie udało się cofnąć oznaczenia"
  },
  form: {
    create: {
      title: "Nowe zadanie", description: "Opisz sprawę i ustal, kiedy ma wracać.",
      submit: "Dodaj zadanie",
      success: (description: string) => `Dodano zadanie: ${description}`,
      failure: "Nie udało się dodać zadania"
    },
    edit: {
      title: "Edycja zadania", description: "Popraw to, co się zmieniło — reszta zostaje bez zmian.",
      submit: "Zapisz zmiany",
      success: (description: string) => `Zapisano zmiany — ${description}`,
      failure: "Nie udało się zapisać zmian"
    },
    fields: {
      description: "Opis", type: "Rodzaj cykliczności", date: "Data", weekday: "Dzień tygodnia",
      dayOfMonth: "Dzień miesiąca", month: "Miesiąc", day: "Dzień",
      intervalValue: "Co ile", intervalUnit: "Jednostka", anchorDate: "Data początkowa"
    },
    placeholders: { description: "Ubezpieczenie domku", weekday: "Wybierz dzień", month: "Wybierz miesiąc" },
    typeOptions: {
      once: "Raz", weekly: "Co tydzień", monthly: "Co miesiąc", yearly: "Co rok", custom: "Co N dni/tygodni/miesięcy"
    },
    intervalUnitOptions: { days: "dni", weeks: "tygodni", months: "miesięcy" },
    cancel: "Anuluj"
  },
  remove: {
    title: "Usunąć zadanie?",
    description: (description: string) => `„${description}" zniknie z listy. Usunięcie jest trwałe, ale przez chwilę da się je cofnąć.`,
    confirm: "Usuń zadanie", cancel: "Zostaw",
    success: (description: string) => `Usunięto zadanie: ${description}`,
    failure: "Nie udało się usunąć zadania",
    undo: "Cofnij",
    restored: (description: string) => `Przywrócono zadanie: ${description}`,
    restoreFailed: "Nie udało się przywrócić zadania"
  },
  notFound: "Tego zadania już nie ma — odświeżam listę",
  loading: "Wczytuję zadania…",
  emptyList: {
    title: "Nie masz jeszcze żadnego zadania",
    description: "Dodaj pierwsze zadanie, żeby nie pamiętać o nim samemu.",
    action: "Dodaj pierwsze zadanie"
  },
  loadError: {
    title: "Nie udało się wczytać zadań",
    description: "Wygląda na problem z połączeniem. Sprawdź sieć i spróbuj ponownie.",
    action: "Spróbuj ponownie"
  }
} as const

export const RECURRENCE_TYPE_OPTIONS = RECURRENCE_TYPES.map((value) => ({
  value, label: tasksCopy.form.typeOptions[value]
}))
export const WEEKDAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7].map((value) => ({ value: String(value), label: WEEKDAY_NAMES[value] ?? "" }))
export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1).map((value) => ({
  value: String(value), label: MONTH_NAMES_NOMINATIVE[value] ?? ""
}))
export const INTERVAL_UNIT_OPTIONS = INTERVAL_UNITS.map((value) => ({ value, label: tasksCopy.form.intervalUnitOptions[value] }))
