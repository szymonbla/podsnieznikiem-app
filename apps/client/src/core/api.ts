import createClient from "openapi-fetch"

import type { paths } from "../generated/api"

/**
 * A thin, typed wrapper around `fetch`. Paths and response shapes come from
 * `generated/api.d.ts` — that is, from the server contract, not from a hand
 * transcription. No runtime beyond `openapi-fetch` itself (DESIGN.md §5).
 *
 * The base URL is always the **same origin** as the app: in dev the Vite proxy
 * points `/api` at the Effect server, and in the end both live under one
 * domain. The origin is spelled out because `fetch` outside a browser (seam 2
 * tests) does not resolve relative addresses.
 */
export const API_BASE_URL = new URL("/api", window.location.origin).toString()

export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
  // `openapi-fetch` would capture `globalThis.fetch` at import time. We reach
  // for it on every request so that swapping the network in seam 2 tests works
  // regardless of import order.
  fetch: (request) => globalThis.fetch(request)
})
