/**
 * Focus returns to wherever a dialog was opened from (spec 0001, story 64).
 *
 * The dialog works this out for itself, so nothing above it has to hand the
 * opening element down. What the primitive's own restore cannot survive is the
 * case that matters here: opened from a row menu, the element focused at the
 * moment of opening is the menu item, and the menu is gone by the time the
 * dialog is up. Hence a short trail of what held focus rather than a single
 * element — the menu item drops out as detached and the menu button behind it
 * stands in.
 */
const TRAIL_DEPTH = 6

/** What most recently held focus, newest first. */
const trail: Array<HTMLElement> = []

if (typeof document !== "undefined") {
  document.addEventListener(
    "focusin",
    (event) => {
      const target = event.target
      if (!(target instanceof HTMLElement)) return

      const rest = trail.filter((element) => element !== target)
      trail.length = 0
      trail.push(target, ...rest.slice(0, TRAIL_DEPTH - 1))
    },
    true
  )
}

/**
 * The newest element still on the page and outside any dialog. Whatever the
 * dialog focused on opening is skipped — otherwise every dialog would end up
 * promising to return focus to its own panel. Nothing outside can take focus
 * while the dialog is up, so the answer holds from opening to closing and is
 * read only once, when it is needed.
 */
const opener = (): HTMLElement | null =>
  trail.find(
    (element) =>
      document.contains(element) &&
      element.closest("[role='dialog'], [role='alertdialog']") === null
  ) ?? null

/**
 * The dialog's `onCloseAutoFocus`. With nothing worth returning to it stands
 * down, leaving the primitive's own restore in charge.
 */
export const returnFocusToOpener = (event: Event): void => {
  const element = opener()
  if (element === null) return

  event.preventDefault()
  element.focus()
}
