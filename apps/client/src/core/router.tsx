import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect
} from "@tanstack/react-router"

import { ContactsScreen } from "../modules/contacts"

/**
 * Drzewo tras w kodzie, nie z konwencji plików — trasy są jawne i widoczne
 * w jednym miejscu (DESIGN.md §2). Powłoka (sidebar, layout) dojdzie do
 * korzenia osobnym ticketem; dziś korzeń tylko renderuje trasę potomną.
 */
const rootRoute = createRootRoute({ component: Outlet })

/** Kontakty to jedyny gotowy ekran, więc korzeń prowadzi prosto do niego. */
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/kontakty" })
  }
})

const contactsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/kontakty",
  component: ContactsScreen
})

export const routeTree = rootRoute.addChildren([indexRoute, contactsRoute])

type RouterOptions = Omit<Parameters<typeof createRouter>[0], "routeTree">

/**
 * Fabryka, żeby test szwu 2 mógł podstawić historię w pamięci i wejść
 * bezpośrednio pod badany adres.
 */
export const createAppRouter = (options?: RouterOptions) =>
  createRouter({ ...options, routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
