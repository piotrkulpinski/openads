"use client"

import * as TogglePrimitive from "@radix-ui/react-toggle"
import type { ComponentProps } from "react"
import { type VariantProps, cva, cx } from "../lib/utils"

const toggleVariants = cva({
  base: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  variants: {
    variant: {
      default: "bg-transparent",
      outline:
        "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
    },
    size: {
      default: "h-9 px-3",
      sm: "h-8 px-2",
      lg: "h-10 px-3",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

type ToggleProps = ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>

const Toggle = ({ className, variant, size, ...props }: ToggleProps) => {
  return (
    <TogglePrimitive.Root className={cx(toggleVariants({ variant, size, className }))} {...props} />
  )
}

export { Toggle, toggleVariants }
