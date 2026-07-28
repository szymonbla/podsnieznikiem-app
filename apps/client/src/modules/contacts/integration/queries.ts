import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "../../../core/api"
import { CONTACTS_QUERY_KEY, CONTACTS_STALE_TIME_MS } from "../configuration/query-settings"
import { isContactField } from "../configuration/schema"
import type {
  Contact,
  ContactField,
  ContactWriteFailure,
  CreateContactBody,
  UpdateContactBody
} from "../domain/models"

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

/**
 * Awaria zapisu w kształcie, na który ekran potrafi zareagować: `notFound`
 * prowadzi do unieważnienia listy (jest nieaktualna), `fieldErrors` wracają na
 * konkretne pola formularza, reszta to komunikat ogólny (DESIGN.md §8).
 */
export class ContactMutationError extends Error {
  constructor(
    message: string,
    readonly notFound: boolean,
    readonly fieldErrors: Partial<Readonly<Record<ContactField, string>>>
  ) {
    super(message)
    this.name = "ContactMutationError"
  }
}

/**
 * Nazwa błędu domenowego, którego obsługa już istnieje. Dołożenie kolejnego
 * błędu na serwerze zmienia unię w kontrakcie, a wtedy ten parametr przestaje
 * przyjmować `tag` — kompilacja pada, dopóki nowy przypadek nie dostanie
 * gałęzi (DESIGN.md §8).
 */
const assertHandled = (tag: "ContactNotFound"): void => void tag

/**
 * Odpowiedź błędna zamieniana raz, w jednym miejscu: błąd domenowy rozpoznawany
 * po tagu, walidacja schematu rozkładana na pola po ścieżce z błędu parsowania.
 *
 * Rozgałęzienie jest wyczerpujące: nowy błąd domenowy w kontrakcie nie ma
 * gałęzi, więc `assertHandled` przestaje się kompilować.
 */
const toMutationError = (
  status: number,
  body: ContactWriteFailure | undefined
): ContactMutationError => {
  if (body?._tag === "ContactNotFound") {
    assertHandled(body._tag)

    return new ContactMutationError("Kontakt nie istnieje", true, {})
  }

  const fieldErrors: Partial<Record<ContactField, string>> = {}
  for (const issue of body?.issues ?? []) {
    const field = issue.path[0]
    if (isContactField(field)) fieldErrors[field] ??= issue.message
  }

  return new ContactMutationError(
    `Żądanie nie powiodło się (HTTP ${status})`,
    false,
    fieldErrors
  )
}

/**
 * Optymistyczna mutacja listy: ekran pokazuje wynik od razu, cache wraca do
 * poprzedniego stanu przy błędzie, a po zakończeniu lista jest unieważniana —
 * jeden przepis dla dodawania, edycji i usuwania (DESIGN.md §9).
 */
const useOptimisticContacts = () => {
  const queryClient = useQueryClient()

  return {
    /** Zdejmuje w locie zapytania, żeby odpowiedź w drodze nie nadpisała podglądu. */
    apply: async (change: (contacts: ReadonlyArray<Contact>) => ReadonlyArray<Contact>) => {
      await queryClient.cancelQueries({ queryKey: CONTACTS_QUERY_KEY })
      const previous = queryClient.getQueryData<ReadonlyArray<Contact>>(CONTACTS_QUERY_KEY)
      if (previous !== undefined) {
        queryClient.setQueryData(CONTACTS_QUERY_KEY, change(previous))
      }

      return { previous }
    },
    revert: (context: { previous: ReadonlyArray<Contact> | undefined } | undefined) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(CONTACTS_QUERY_KEY, context.previous)
      }
    },
    invalidate: () => {
      void queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY })
    }
  }
}

/**
 * Kontakt widoczny natychmiast, jeszcze przed odpowiedzią serwera. Tymczasowy
 * identyfikator jest lokalny i żyje do unieważnienia listy — prawdziwy nadaje
 * baza (ADR-0003: „Cofnij" i tak tworzy wpis o nowej tożsamości).
 */
export const DRAFT_ID_PREFIX = "draft:"

/** Wpis widoczny tylko lokalnie — jeszcze bez tożsamości nadanej przez bazę. */
export const isDraft = (contact: Contact): boolean => contact.id.startsWith(DRAFT_ID_PREFIX)

const draftContact = (body: CreateContactBody): Contact => {
  const now = new Date().toISOString()

  return { id: `${DRAFT_ID_PREFIX}${crypto.randomUUID()}`, ...body, createdAt: now, updatedAt: now }
}

export const useCreateContact = () => {
  const cache = useOptimisticContacts()

  return useMutation({
    mutationFn: async (body: CreateContactBody): Promise<Contact> => {
      const { data, error, response } = await apiClient.POST("/contacts", { body })
      if (error !== undefined || data === undefined) {
        throw toMutationError(response.status, error)
      }

      return data
    },
    onMutate: (body) => cache.apply((contacts) => [...contacts, draftContact(body)]),
    onError: (_error, _body, context) => cache.revert(context),
    onSettled: cache.invalidate
  })
}

export const useUpdateContact = () => {
  const cache = useOptimisticContacts()

  return useMutation({
    mutationFn: async ({
      id,
      body
    }: {
      readonly id: string
      readonly body: UpdateContactBody
    }): Promise<Contact> => {
      const { data, error, response } = await apiClient.PATCH("/contacts/{id}", {
        params: { path: { id } },
        body
      })
      if (error !== undefined || data === undefined) {
        throw toMutationError(response.status, error)
      }

      return data
    },
    onMutate: ({ id, body }) =>
      cache.apply((contacts) =>
        contacts.map((contact) =>
          contact.id === id
            ? // Znacznik modyfikacji podnoszony też w podglądzie — inaczej lista
              // pokazywałaby starą datę aż do unieważnienia (ticket 09).
              { ...contact, ...body, updatedAt: new Date().toISOString() }
            : contact
        )
      ),
    onError: (_error, _variables, context) => cache.revert(context),
    onSettled: cache.invalidate
  })
}

export const useDeleteContact = () => {
  const cache = useOptimisticContacts()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error, response } = await apiClient.DELETE("/contacts/{id}", {
        params: { path: { id } }
      })
      if (error !== undefined) {
        throw toMutationError(response.status, error)
      }
    },
    onMutate: (id) => cache.apply((contacts) => contacts.filter((contact) => contact.id !== id)),
    onError: (_error, _id, context) => cache.revert(context),
    onSettled: cache.invalidate
  })
}
