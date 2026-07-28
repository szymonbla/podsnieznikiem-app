import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/libs/ui/utils"

/**
 * The design's field label: 12 px, bold, dimmed — smaller and lighter than the
 * content it describes, so it does not compete with it for attention.
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-2xs leading-none font-bold text-muted-foreground select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
