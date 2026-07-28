import { http, HttpResponse, type HttpHandler } from "msw"
import { setupServer } from "msw/node"

import type { Contact } from "../modules/contacts"

/**
 * Serwer podszywający się pod API — sieć jest jedyną podstawioną granicą szwu 2.
 * Mieszka osobno od `harness.tsx`, bo jego cyklem życia steruje preload (jeden
 * nasłuch na proces), a preload nie może wciągać drzewa Reacta przed
 * zarejestrowaniem DOM-u.
 *
 * `*` w ścieżkach handlerów rozstrzyga adres bazowy — klient uderza pod
 * względne `/api`, a test nie musi znać originu, na którym stoi happy-dom.
 */
export const mockApi = setupServer()

export const apiHandlers = {
  contacts: (contacts: ReadonlyArray<Contact>): HttpHandler =>
    http.get("*/api/contacts", () => HttpResponse.json(contacts))
}
