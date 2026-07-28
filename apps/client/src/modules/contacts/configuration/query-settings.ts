/** Klucz cache'u listy — jedno źródło dla zapytania i przyszłych unieważnień. */
export const CONTACTS_QUERY_KEY = ["contacts"] as const

/**
 * Listę zmienia jedna osoba z jednej przeglądarki, więc dane starzeją się
 * wolno — pięć minut świeżości oszczędza zapytania przy każdym wejściu
 * na ekran (DESIGN.md §9).
 */
export const CONTACTS_STALE_TIME_MS = 5 * 60 * 1000
