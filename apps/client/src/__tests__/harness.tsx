import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router"
import { render } from "@testing-library/react"

import { createQueryClient } from "../core/query"
import { createAppRouter } from "../core/router"

/**
 * Szew 2 — test renderuje ekran razem z routerem i warstwą zapytań, a sieć
 * podstawia serwer podszywający się pod API (MSW), nie atrapa modułu. Dzięki
 * temu klient HTTP, react-query i komponenty są w teście prawdziwe, a jedyną
 * granicą jest to, co naprawdę wychodzi na sieć.
 */
export { apiHandlers, contactsApi, mockApi } from "./msw"
export { aContact } from "./contact-builder"

/**
 * Renderuje aplikację pod wskazanym adresem, tak jak zrobiłaby to przeglądarka.
 * Zwraca też router, bo część zachowania widać wyłącznie w adresie — filtr
 * i sortowanie są w nim zapisywane i z niego czytane.
 */
export const renderApp = (initialPath: string) => {
  const queryClient = createQueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  const history = createMemoryHistory({ initialEntries: [initialPath] })
  const router = createAppRouter({ history })

  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    ),
    /** Adres tak, jak zobaczyłby go pasek przeglądarki — ze znakiem zapytania. */
    currentUrl: () => router.state.location.href,
    /** „Wstecz" przeglądarki — historia jest w pamięci, więc trzeba ją cofnąć wprost. */
    goBack: () => history.back()
  }
}
