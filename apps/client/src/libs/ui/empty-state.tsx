import type { ReactNode } from "react"

interface EmptyStateProps {
  readonly title: string
  readonly description: string
  readonly action?: ReactNode
  /**
   * A load error is a message about an event, not a description of the state
   * found — a screen reader should hear it the moment it appears.
   */
  readonly assertive?: boolean
}

/**
 * One frame for all three empty screens — no contacts, no filter matches and a
 * connection error. They do not differ in layout, only in text and in where
 * they lead; a shared shape keeps them told apart by what really differs.
 */
export const EmptyState = ({ title, description, action, assertive }: EmptyStateProps) => (
  <div
    role={assertive === true ? "alert" : "status"}
    className="animate-fade-up rounded-panel border border-dashed border-border-dashed bg-surface px-5 py-10 text-center wide:px-6 wide:py-16"
  >
    {/*
      The frame is dashed, not solid — a place where something is not there yet
      looks different from a place where something is.
    */}
    <p className="mb-1.5 font-heading text-xl font-bold tracking-[-0.02em]">{title}</p>
    <p className="mx-auto mb-5 max-w-[42ch] text-ink-soft">{description}</p>
    {action}
  </div>
)
