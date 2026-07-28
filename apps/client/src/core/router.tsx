import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect
} from "@tanstack/react-router"

import { ContactsScreen } from "../modules/contacts"
import { AppShell } from "./layouts/app-shell"

/**
 * Drzewo tras w kodzie, nie z konwencji plików — trasy są jawne i widoczne
 * w jednym miejscu (DESIGN.md §2). Korzeń renderuje powłokę, więc każda trasa
 * dostaje nawigację bez powtarzania jej u siebie.
 */
const rootRoute = createRootRoute({ component: AppShell })

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
