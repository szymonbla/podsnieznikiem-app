import { Link, Outlet } from "@tanstack/react-router"

import { shellCopy } from "./copy"

/**
 * Sekcja zapowiedziana, ale jeszcze nieistniejąca. Nie ma `href` — nie ma dokąd
 * prowadzić — więc rola linku musi zostać nadana jawnie, żeby czytnik ekranu
 * usłyszał pozycję nawigacji, a nie zwykły tekst. `aria-disabled` mówi, że jest
 * niegotowa; etykieta „Wkrótce" powtarza to słowami, bo poniżej progu wąskiego
 * ekranu nagłówek grupy znika.
 */
const UpcomingItem = ({ label }: { readonly label: string }) => (
  <span
    role="link"
    aria-disabled="true"
    className="flex items-center justify-between gap-2 rounded-[var(--radius)] px-3 py-2 text-sm text-white/38"
  >
    {label}
    <span className="rounded-pill bg-white/8 px-2 py-0.5 label-caps text-white/45">
      {shellCopy.upcomingBadge}
    </span>
  </span>
)

/**
 * Powłoka aplikacji — nazwa domku, nawigacja i stopka właściciela wokół treści
 * trasy. Mieszka w `core`, więc nie wie nic o kontaktach ani o żadnej innej
 * domenie (DESIGN.md §3); dostaje ekran przez `Outlet`.
 *
 * Poniżej 900 px sidebar zamienia się w poziomy pasek nad treścią, a grupa
 * „Wkrótce" i stopka znikają — na telefonie właściciel przychodzi po numer,
 * nie po zapowiedzi (DESIGN.md §9).
 */
export const AppShell = () => (
  <div className="min-h-screen wide:grid wide:grid-cols-[var(--spacing-sidebar)_1fr]">
    <nav
      aria-label={shellCopy.navigationLabel}
      className="flex items-center gap-4 bg-foreground px-4 py-3 text-white wide:h-screen wide:flex-col wide:items-stretch wide:gap-6 wide:overflow-y-auto wide:px-4 wide:py-6"
    >
      <p className="font-heading text-base font-bold tracking-[-0.02em] wide:text-lg">
        {shellCopy.cottage}
      </p>

      <ul className="flex flex-1 list-none items-center gap-1 p-0 wide:flex-none wide:flex-col wide:items-stretch">
        <li>
          <Link
            to="/kontakty"
            activeProps={{ "aria-current": "page" }}
            className="block rounded-[var(--radius)] px-3 py-2 text-sm font-medium text-white/70 hover:bg-foreground-strong aria-[current=page]:bg-primary-subtle aria-[current=page]:text-white"
          >
            {shellCopy.contacts}
          </Link>
        </li>
      </ul>

      {/* Grupa zapowiedzi i stopka są dodatkiem — na wąskim ekranie ustępują liście. */}
      <div className="hidden wide:block">
        <p id="upcoming-group" className="px-3 pb-2 label-caps text-white/38">
          {shellCopy.upcomingGroup}
        </p>
        {/* Nagłówek grupy nazywa listę, więc czytnik ekranu wchodzi w nią z kontekstem. */}
        <ul aria-labelledby="upcoming-group" className="list-none p-0">
          {shellCopy.upcoming.map((label) => (
            <li key={label}>
              <UpcomingItem label={label} />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto hidden items-center gap-3 border-t border-white/10 px-3 pt-4 wide:flex">
        <span
          aria-hidden="true"
          className="flex size-9 items-center justify-center rounded-pill bg-white/10 text-xs font-bold"
        >
          {shellCopy.owner.initials}
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-medium">{shellCopy.owner.name}</span>
          <span className="text-2xs text-white/45">{shellCopy.owner.role}</span>
        </span>
      </div>
    </nav>

    <div className="wide:h-screen wide:overflow-y-auto">
      <Outlet />
    </div>
  </div>
)
