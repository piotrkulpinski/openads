"use client"

import * as SliderPrimitive from "@radix-ui/react-slider"
import type { ComponentProps } from "react"
import { cx } from "../lib/cva"

const Slider = ({ className, ...props }: ComponentProps<typeof SliderPrimitive.Root>) => (
  <SliderPrimitive.Root
    className={cx("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow-sm transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
)

export { Slider }