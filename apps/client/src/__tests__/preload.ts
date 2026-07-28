import { afterEach } from "bun:test"
import { GlobalRegistrator } from "@happy-dom/global-registrator"

/**
 * Seam 2 renders a real React tree, so the tests need a DOM. Registration
 * happens in the preload, before anything imports `react-dom`.
 */

// happy-dom also replaces `fetch` with its own `node:http`-based
// implementation, which MSW under bun does not intercept — requests would
// really go out to the network. We keep the DOM but restore bun's native
// `fetch`, the one MSW's interceptor works on.
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
 * There is one MSW listener per process, not per file — bun runs the test files
 * in a shared process, so a `close()` in one of them would take the stubbed
 * network away from the rest. The import is dynamic so that it runs after the
 * DOM is registered.
 */
const { mockApi } = await import("./msw")

mockApi.listen({ onUnhandledRequest: "error" })
afterEach(() => mockApi.resetHandlers())

/**
 * Bun does not wire up Testing Library's automatic cleanup, and all the files
 * share one document — without this the previous test's tree stays in the DOM
 * and role queries see two screens at once.
 */
const { cleanup } = await import("@testing-library/react")

afterEach(cleanup)
