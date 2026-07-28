/**
 * What the Contacts screen shows instead of, or as, the list. An empty screen
 * is never ambiguous — loading, no contacts, no filter matches and a connection
 * error are four different situations with four different messages (spec 0001,
 * stories 7, 8, 16, 68, 69).
 */
export type ScreenState = "loading" | "error" | "empty" | "no-matches" | "list"

export interface ScreenInput {
  readonly isPending: boolean
  readonly isError: boolean
  /** How many contacts there are in total, before the filter. */
  readonly total: number
  /** How many of them the filter left. */
  readonly matches: number
}

/**
 * The whole situation named once. The order of the checks is the rule — "an
 * error beats emptiness, emptiness beats the filter" — and it is stated here so
 * that it can be read and checked in one place, rather than reconstructed from
 * the nesting of the screen's JSX.
 */
export const screenState = ({ isPending, isError, total, matches }: ScreenInput): ScreenState => {
  if (isPending) return "loading"
  if (isError) return "error"
  if (total === 0) return "empty"
  if (matches === 0) return "no-matches"

  return "list"
}

/** The filter field and the counter only make sense once there is something to count and filter. */
export const hasRows = (state: ScreenState): boolean =>
  state === "no-matches" || state === "list"

/**
 * Whether the list is known. Adding stays quiet while loading and on error:
 * appending to a list we do not know would end in a duplicate.
 */
export const isReady = (state: ScreenState): boolean =>
  state !== "loading" && state !== "error"
