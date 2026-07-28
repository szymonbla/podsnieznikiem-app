import { afterEach } from "bun:test"
import { GlobalRegistrator } from "@happy-dom/global-registrator"

/**
 * Szew 2 renderuje prawdziwe drzewo Reacta, więc testom potrzebny jest DOM.
 * Rejestracja idzie w preloadzie, zanim cokolwiek zaimportuje `react-dom`.
 */

// happy-dom podmienia też `fetch` na własną implementację opartą o `node:http`,
// której MSW pod bunem nie przechwytuje — żądania wychodziłyby naprawdę
// w sieć. Zostawiamy DOM, ale przywracamy natywnego `fetch` buna, na którym
// interceptor MSW działa.
const nativeFetch = globalThis.fetch
const NativeRequest = globalThis.Request
const NativeResponse = globalThis.Response
const NativeHeaders = globalThis.Headers

GlobalRegistrator.register({ url: "http://localhost/" })

globalThis.fetch = nativeFetch
globalThis.Request = NativeRequest
globalThis.Response = NativeResponse
globalThis.Headers = NativeHeaders

/**
 * Nasłuch MSW jest jeden na proces, a nie jeden na plik — bun uruchamia pliki
 * testowe we wspólnym procesie, więc `close()` w jednym z nich zdejmowałby
 * podstawioną sieć pozostałym. Import jest dynamiczny, żeby wykonał się już
 * po rejestracji DOM-u.
 */
const { mockApi } = await import("./msw")

mockApi.listen({ onUnhandledRequest: "error" })
afterEach(() => mockApi.resetHandlers())

/**
 * Bun nie wpina automatycznego sprzątania Testing Library, a wszystkie pliki
 * dzielą jeden dokument — bez tego drzewo z poprzedniego testu zostaje w DOM-ie
 * i zapytania po roli widzą dwa ekrany naraz.
 */
const { cleanup } = await import("@testing-library/react")

afterEach(cleanup)
