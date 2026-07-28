import { createContext, useContext, useEffect, useMemo, useRef } from "react"

type Dismiss = () => void

interface LayerStack {
  /** Puts a layer on top; the returned call takes it off again. */
  readonly register: (dismiss: Dismiss) => () => void
}

const LayerStackContext = createContext<LayerStack | null>(null)

export const EscapeLayerProvider = LayerStackContext.Provider

/**
 * Content nested inside a dialog that `Escape` should close before the dialog
 * itself — a suggestion list, say. The layer announces itself while it is up
 * instead of leaving a mark in the DOM for the dialog to hunt for with a
 * selector: a registration the compiler checks on both sides.
 */
export const useEscapeLayer = (active: boolean, dismiss: Dismiss): void => {
  const stack = useContext(LayerStackContext)
  const latest = useRef(dismiss)
  latest.current = dismiss

  useEffect(() => {
    if (!active || stack === null) return

    return stack.register(() => {
      latest.current()
    })
  }, [active, stack])
}

export interface EscapeLayers {
  /** Goes to `EscapeLayerProvider`, so nested content can register. */
  readonly stack: LayerStack
  /** Closes the innermost layer; `false` means there was none and `Escape` belongs to the dialog. */
  readonly dismissTop: () => boolean
}

/**
 * The dialog side of the arrangement: it holds the stack and asks the innermost
 * layer to close. So `Escape` peels one layer at a time — the first closes the
 * suggestion list, the second the dialog (spec 0001, story 66).
 */
export const useEscapeLayers = (): EscapeLayers => {
  const layers = useRef<ReadonlyArray<Dismiss>>([])

  const stack = useMemo<LayerStack>(
    () => ({
      register: (dismiss) => {
        layers.current = [...layers.current, dismiss]

        return () => {
          layers.current = layers.current.filter((entry) => entry !== dismiss)
        }
      }
    }),
    []
  )

  return {
    stack,
    dismissTop: () => {
      const top = layers.current.at(-1)
      if (top === undefined) return false

      top()

      return true
    }
  }
}
