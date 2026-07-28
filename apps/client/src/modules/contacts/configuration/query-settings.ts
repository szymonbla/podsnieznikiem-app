/** The list cache key — one source for the query and for future invalidations. */
export const CONTACTS_QUERY_KEY = ["contacts"] as const

/**
 * One person changes the list from one browser, so the data goes stale slowly
 * — five minutes of freshness saves a request on every visit to the screen
 * (DESIGN.md §9).
 */
export const CONTACTS_STALE_TIME_MS = 5 * 60 * 1000

/**
 * The window for undoing a deletion: long enough for the owner to react, short
 * enough that the notification does not get in the way (DESIGN.md §9,
 * spec 0001, story 54).
 */
export const UNDO_WINDOW_MS = 6 * 1000
