import type { Contact } from "../domain/models"
import { contactsCopy } from "./copy"

interface ContactsTableProps {
  readonly contacts: ReadonlyArray<Contact>
}

/**
 * Zwykła tabela HTML — trzy kolumny, bez paginacji i bez sortowania po stronie
 * serwera, więc biblioteka do tabel byłaby narzutem (DESIGN.md §2).
 * Semantyka `table` daje rolę wiersza i nagłówka za darmo; testy szwu 2
 * opierają się właśnie na niej.
 */
export const ContactsTable = ({ contacts }: ContactsTableProps) => (
  <table>
    <thead>
      <tr>
        <th scope="col">{contactsCopy.columns.name}</th>
        <th scope="col">{contactsCopy.columns.role}</th>
        <th scope="col">{contactsCopy.columns.phone}</th>
      </tr>
    </thead>
    <tbody>
      {contacts.map((contact) => (
        <tr key={contact.id}>
          <td>{contact.name}</td>
          <td>{contact.role}</td>
          <td>{contact.phone}</td>
        </tr>
      ))}
    </tbody>
  </table>
)
