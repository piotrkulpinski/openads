"use client"

import * as PopoverPrimitive from "@radix-ui/react-popover"
import type { ComponentProps } from "react"
import { popoverAnimationClasses } from "../lib/classes"
import { cx } from "../lib/cva"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverAnchor = PopoverPrimitive.Anchor

const PopoverContent = ({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      align={align}
      sideOffset={sideOffset}
      className={cx(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden",
        popoverAnimationClasses,
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
)

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
