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
