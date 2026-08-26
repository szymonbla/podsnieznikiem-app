export type ScreenState = "loading" | "error" | "empty" | "list"

export interface ScreenInput {
  readonly isPending: boolean
  readonly isError: boolean
  readonly total: number
}

export const screenState = ({ isPending, isError, total }: ScreenInput): ScreenState => {
  if (isPending) return "loading"
  if (isError) return "error"
  if (total === 0) return "empty"
  return "list"
}

export const isReady = (state: ScreenState): boolean => state !== "loading" && state !== "error"
