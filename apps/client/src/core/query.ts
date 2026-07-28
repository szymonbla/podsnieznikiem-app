import { QueryClient, type QueryClientConfig } from "@tanstack/react-query"

/**
 * Fabryka, nie singleton — testy szwu 2 potrzebują świeżego cache'u na każdy
 * przypadek i własnej polityki ponowień. Czasy świeżości należą do konkretnych
 * zapytań (patrz moduł kontaktów), nie tutaj.
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
