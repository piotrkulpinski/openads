"use client"

import { Progress as ProgressPrimitive } from "radix-ui"
import type { ComponentProps } from "react"
import { cx } from "../lib/cva"

const Progress = ({
  className,
  value,
  ...props
}: ComponentProps<typeof ProgressPrimitive.Root>) => {
  return (
    <ProgressPrimitive.Root
      className={cx("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
