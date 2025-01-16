import type { ComponentProps } from "react"
import { cx } from "../lib/cva"

const Textarea = ({ className, ...props }: ComponentProps<"textarea">) => {
  return (
    <textarea
      className={cx(
        "flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs resize-none field-sizing-content placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
