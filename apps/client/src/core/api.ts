import createClient from "openapi-fetch"

import type { paths } from "../generated/api"

/**
 * A thin, typed wrapper around `fetch`. Paths and response shapes come from
 * `generated/api.d.ts` — that is, from the server contract, not from a hand
 * transcription. No runtime beyond `openapi-fetch` itself (DESIGN.md §5).
 *
 * Two deployments, two base URLs:
 *
 *   - In dev and in seam 2 tests nothing is set, so the address is the app's
 *     **own origin** under `/api`. The Vite proxy forwards that to the Effect
 *     server, and the browser never sees a cross-origin request.
 *   - In production the static files live on Cloudflare Pages and the server
 *     lives in AWS, so they cannot share an origin. `VITE_API_URL` is baked in
 *     at build time and the server allows that origin explicitly (CORS).
 *
 * The origin is spelled out in the fallback because `fetch` outside a browser
 * (seam 2 tests) does not resolve relative addresses.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? new URL("/api", window.location.origin).toString()

export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
  // The app and the API live on different subdomains in production
  // (app.podsnieznikiem.pl vs api.podsnieznikiem.pl). `fetch` omits cookies
  // on cross-origin requests unless told otherwise, so without this the
  // Cloudflare Access session cookie never reaches the API and every call
  // looks unauthenticated.
  credentials: "include",
  // `openapi-fetch` would capture `globalThis.fetch` at import time. We reach
  // for it on every request so that swapping the network in seam 2 tests works
  // regardless of import order.
  fetch: (request) => globalThis.fetch(request)
})
