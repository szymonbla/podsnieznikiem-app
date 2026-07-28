import { useContacts } from "../integration/queries"
import { ContactsTable } from "./contacts-table"
import { contactsCopy } from "./copy"

/**
 * Ekran Kontaktów. Stany ładowania i błędu sieci mają własny ticket —
 * do tego czasu tabela po prostu nie ma czego pokazać.
 */
export const ContactsScreen = () => {
  const { data } = useContacts()

  return (
    <main>
      <h1>{contactsCopy.title}</h1>
      <ContactsTable contacts={data ?? []} />
    </main>
  )
}
