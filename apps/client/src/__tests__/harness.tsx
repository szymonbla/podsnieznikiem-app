import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router"
import { render } from "@testing-library/react"

import { createQueryClient } from "../core/query"
import { createAppRouter } from "../core/router"

/**
 * Seam 2 — the test renders the screen together with the router and the query
 * layer, and the network is stubbed by a server standing in for the API (MSW),
 * not by a module double. That keeps the HTTP client, react-query and the
 * components real in the test, with the only boundary being what actually goes
 * out to the network.
 */
export { apiHandlers, contactsApi, taskApiHandlers, tasksApi, mockApi } from "./msw"
export { aContact } from "./contact-builder"
export { aTask } from "./task-builder"

/**
 * Renders the application at the given address, the way a browser would. It
 * also returns the router, because some behaviour is visible only in the
 * address — the filter and the sort are written to and read from it.
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
    /** The address as a browser's bar would show it — query string included. */
    currentUrl: () => router.state.location.href,
    /** The browser's "back" — the history is in memory, so it has to be stepped back explicitly. */
    goBack: () => history.back()
  }
}
