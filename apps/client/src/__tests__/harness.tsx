import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router"
import { render } from "@testing-library/react"

import { createQueryClient } from "../core/query"
import { createAppRouter } from "../core/router"
import type { Contact } from "../modules/contacts"

/**
 * Szew 2 — test renderuje ekran razem z routerem i warstwą zapytań, a sieć
 * podstawia serwer podszywający się pod API (MSW), nie atrapa modułu. Dzięki
 * temu klient HTTP, react-query i komponenty są w teście prawdziwe, a jedyną
 * granicą jest to, co naprawdę wychodzi na sieć.
 */
export { apiHandlers, mockApi } from "./msw"

let sequence = 0

/**
 * Kontakt o kompletnym kształcie kontraktu — test nadpisuje tylko to, co bada.
 * Typ pochodzi z modułu, więc nowe pole na serwerze psuje kompilację tutaj,
 * zamiast po cichu zostawić nieaktualną atrapę.
 */
export const aContact = (overrides: Partial<Contact> = {}): Contact => {
  sequence += 1
  return {
    id: `00000000-0000-4000-8000-${String(sequence).padStart(12, "0")}`,
    name: "Grzegorz Sobczak",
    role: "Złota rączka",
    phone: "602118447",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
    ...overrides
  }
}

/** Renderuje aplikację pod wskazanym adresem, tak jak zrobiłaby to przeglądarka. */
export const renderApp = (initialPath: string) => {
  const queryClient = createQueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  const router = createAppRouter({
    history: createMemoryHistory({ initialEntries: [initialPath] })
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
