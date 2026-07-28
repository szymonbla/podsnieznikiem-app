import { Link, Outlet } from "@tanstack/react-router"
import { CalendarDays, MessageSquare, Phone, Wallet } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Toaster } from "../../libs/ui/sonner"
import { shellCopy } from "./copy"

/** Icons for the announced sections — in the same order as the labels in `copy.ts`. */
const UPCOMING_ICONS: ReadonlyArray<LucideIcon> = [CalendarDays, Wallet, MessageSquare]

/**
 * A section that is announced but does not exist yet. It has no `href` — there
 * is nowhere to lead — so the link role has to be given explicitly for a screen
 * reader to hear a navigation item rather than plain text. `aria-disabled` says
 * it is not ready.
 *
 * The "coming soon" word sits next to every item but stays invisible: the eye
 * reads it once, from the group heading, while a screen reader enters the list
 * item by item and without the repetition would hear only the name — it cannot
 * see the dimming.
 */
const UpcomingItem = ({
  label,
  icon: Icon
}: {
  readonly label: string
  readonly icon: LucideIcon
}) => (
  <span
    role="link"
    aria-disabled="true"
    className="flex cursor-default items-center gap-2.5 rounded-[var(--radius)] p-2.5 text-sm font-semibold text-ink-soft"
  >
    <Icon aria-hidden="true" className="size-[17px] shrink-0" strokeWidth={1.9} />
    {label}
    <span className="sr-only">{shellCopy.upcomingBadge}</span>
  </span>
)

/**
 * The application shell — the cottage name, the navigation and the owner
 * footer around the route's content. It lives in `core`, so it knows nothing
 * about contacts or any other domain (DESIGN.md §3); it receives the screen
 * through `Outlet`.
 *
 * The sidebar is white and a line separates it from the content, not a
 * difference in lightness — in this design planes are divided by drawing, not
 * by weight.
 *
 * Below 900 px the sidebar turns into a horizontal bar above the content, and
 * the "coming soon" group and the footer disappear — on a phone the owner
 * comes for a number, not for announcements (DESIGN.md §9).
 */
export const AppShell = () => (
  <div className="min-h-screen bg-background wide:grid wide:grid-cols-[var(--spacing-sidebar)_1fr]">
    {/*
      The navigation comes before the content in tab order, and on a narrow
      screen it is a horizontal bar as well — without this shortcut the keyboard
      walks through it on every visit to a screen. Visible only on focus.
    */}
    <a
      href="#tresc"
      className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-3 focus-visible:left-3 focus-visible:z-50 focus-visible:rounded-card focus-visible:bg-foreground focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-bold focus-visible:text-background"
    >
      {shellCopy.skipToContent}
    </a>

    <nav
      aria-label={shellCopy.navigationLabel}
      className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-separator bg-background px-3.5 py-3 wide:sticky wide:top-0 wide:h-screen wide:flex-col wide:flex-nowrap wide:items-stretch wide:gap-5 wide:overflow-y-auto wide:border-r wide:border-b-0 wide:py-[22px]"
    >
      <div className="flex items-center gap-2.5 px-2">
        {/* The cottage mark — decoration, so there is nothing to announce. */}
        <span
          aria-hidden="true"
          className="grid size-7 flex-none place-items-center rounded-pill bg-foreground"
        >
          <span className="size-2.5 rounded-[3px] bg-mark" />
        </span>
        <span className="font-heading text-md leading-[1.1] font-bold tracking-[-0.03em]">
          {shellCopy.cottage}
        </span>
      </div>

      {/*
        The list and the announcements group are one block. In the design the
        distance between them comes from the group heading's own padding, not
        from the sidebar's 20 px rhythm — without this wrapper the `gap-5`
        above lands between them a second time and pushes the whole group
        20 px down.
      */}
      <div className="flex min-w-0 flex-col gap-0.5">
        <ul className="flex list-none flex-wrap items-center gap-1 p-0 wide:flex-col wide:flex-nowrap wide:items-stretch wide:gap-0.5">
          <li>
            <Link
              to="/kontakty"
              activeProps={{ "aria-current": "page" }}
              className="flex items-center gap-2.5 rounded-[var(--radius)] p-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted-hover aria-[current=page]:bg-muted aria-[current=page]:font-bold aria-[current=page]:text-foreground"
            >
              <Phone
                aria-hidden="true"
                className="size-[17px] shrink-0 text-primary"
                strokeWidth={1.9}
              />
              {shellCopy.contacts}
            </Link>
          </li>
        </ul>

        {/* The announcements group and the footer are extras — on a narrow screen they give way to the list. */}
        <div className="hidden wide:block">
          <p id="upcoming-group" className="nav-group-label px-2.5 pt-4 pb-1.5 text-ink-whisper">
            {shellCopy.upcomingGroup}
          </p>
          {/* The group heading names the list, so a screen reader enters it with context. */}
          <ul aria-labelledby="upcoming-group" className="flex list-none flex-col gap-0.5 p-0">
            {shellCopy.upcoming.map((label, index) => (
              <li key={label}>
                <UpcomingItem label={label} icon={UPCOMING_ICONS[index] ?? MessageSquare} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-auto hidden items-center gap-2.5 rounded-card border border-border-soft p-2.5 wide:flex">
        <span
          aria-hidden="true"
          className="grid size-7 flex-none place-items-center rounded-pill bg-avatar text-2xs font-extrabold text-primary"
        >
          {shellCopy.owner.initials}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-xs font-bold">{shellCopy.owner.name}</span>
          <span className="text-2xs text-ink-faint">{shellCopy.owner.role}</span>
        </span>
      </div>
    </nav>

    <div className="min-w-0 wide:h-screen wide:overflow-y-auto">
      <Outlet />
    </div>

    {/*
      There is one place for notifications, in the shell — otherwise every
      screen would mount its own and two at once would show two stacks. The
      shell does not know what will appear in them; the modules send the text.
    */}
    <Toaster containerAriaLabel={shellCopy.notifications} />
  </div>
)
