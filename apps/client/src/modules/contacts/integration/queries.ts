import { useQuery } from "@tanstack/react-query"

import { apiClient } from "../../../core/api"
import { CONTACTS_QUERY_KEY, CONTACTS_STALE_TIME_MS } from "../configuration/query-settings"
import type { Contact } from "../domain/models"

const fetchContacts = async (): Promise<ReadonlyArray<Contact>> => {
  const { data, error, response } = await apiClient.GET("/contacts")

  // `openapi-fetch` nie rzuca — nieudane żądanie wraca jako `error`.
  // react-query oczekuje wyjątku, więc tłumaczymy to tutaj, raz.
  if (error !== undefined || data === undefined) {
    throw new Error(`Nie udało się pobrać kontaktów (HTTP ${response.status})`)
  }

  return data
}

export const useContacts = () =>
  useQuery({
    queryKey: CONTACTS_QUERY_KEY,
    queryFn: fetchContacts,
    staleTime: CONTACTS_STALE_TIME_MS
  })
