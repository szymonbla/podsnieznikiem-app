import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

/**
 * The design's notification: one graphite tile at the bottom centre of the
 * screen, with its action on dimmed white.
 *
 * Per-type colour variants (`richColors`) are deliberately left out — the
 * design gives every notification the same shape, and the type is carried by
 * the icon. There is one theme, light, so `next-themes` from shadcn's default
 * template has nothing to read here; `theme="light"` keeps sonner on our
 * palette even when the system asks for dark.
 */
const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="light"
    position="bottom-center"
    className="toaster group"
    icons={{
      success: <CircleCheckIcon className="size-4" />,
      info: <InfoIcon className="size-4" />,
      warning: <TriangleAlertIcon className="size-4" />,
      error: <OctagonXIcon className="size-4" />,
      loading: <Loader2Icon className="size-4 animate-spin" />
    }}
    toastOptions={{
      classNames: {
        toast:
          "!gap-3.5 !rounded-action !border-0 !bg-foreground !text-xs !font-bold !text-background !shadow-toast animate-fade-up",
        description: "!text-background/70",
        actionButton:
          "!rounded-[var(--radius)] !bg-background/15 !px-3 !py-1.5 !text-xs !font-bold !text-background hover:!bg-background/25",
        closeButton: "!border-0 !bg-foreground !text-background"
      }
    }}
    {...props}
  />
)

export { Toaster }
