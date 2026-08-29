import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect
} from "@tanstack/react-router"

import { ContactsScreen, contactsSearchSchema } from "../modules/contacts"
import { TasksScreen } from "../modules/tasks"
import { AppShell } from "./layouts/app-shell"

/**
 * The route tree in code, not from a file convention — routes are explicit and
 * visible in one place (DESIGN.md §2). The root renders the shell, so every
 * route gets the navigation without repeating it.
 */
const rootRoute = createRootRoute({ component: AppShell })

/** Contacts is the only finished screen, so the root leads straight to it. */
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
  component: ContactsScreen,
  /*
   * The filter and the sort are part of the address, so the router — not the
   * component — is responsible for reading and validating them. The schema
   * comes from the module: `core` owns the route but does not know what "sort
   * by role" means (DESIGN.md §3).
   */
  validateSearch: contactsSearchSchema
})

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/zadania",
  component: TasksScreen
})

export const routeTree = rootRoute.addChildren([indexRoute, contactsRoute, tasksRoute])

type RouterOptions = Omit<Parameters<typeof createRouter>[0], "routeTree">

/**
 * A factory, so a seam 2 test can supply an in-memory history and land
 * directly on the address under test.
 */
export const createAppRouter = (options?: RouterOptions) =>
  createRouter({ ...options, routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
