import createClient from "openapi-fetch"

import type { paths } from "../generated/api"

/**
 * Cienki, typowany wrapper na `fetch`. Ścieżki i kształty odpowiedzi bierze
 * z `generated/api.d.ts`, czyli z kontraktu serwera — nie z ręcznego
 * przepisania. Zero runtime'u poza samym `openapi-fetch` (DESIGN.md §5).
 *
 * Adres bazowy jest zawsze **tym samym originem** co aplikacja: w dev proxy
 * Vite kieruje `/api` na serwer Effecta, docelowo obie stoją pod jedną domeną.
 * Origin doklejamy jawnie, bo `fetch` poza przeglądarką (testy szwu 2)
 * nie rozwija adresów względnych.
 */
export const API_BASE_URL = new URL("/api", window.location.origin).toString()

export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
  // `openapi-fetch` zapamiętałby `globalThis.fetch` w chwili importu. Sięgamy
  // po niego przy każdym żądaniu, żeby podstawienie sieci w testach szwu 2
  // działało niezależnie od kolejności importów.
  fetch: (request) => globalThis.fetch(request)
})
