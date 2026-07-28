import { QueryClient, type QueryClientConfig } from "@tanstack/react-query"

/**
 * A factory, not a singleton — seam 2 tests need a fresh cache per case and
 * their own retry policy. Staleness times belong to individual queries (see
 * the contacts module), not here.
 */
export const createQueryClient = (config?: QueryClientConfig): QueryClient =>
  new QueryClient({
    ...config,
    defaultOptions: {
      ...config?.defaultOptions,
      queries: {
        refetchOnWindowFocus: false,
        ...config?.defaultOptions?.queries
      }
    }
  })
