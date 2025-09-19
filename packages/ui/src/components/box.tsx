import { Slot } from "radix-ui"
import type { ComponentProps } from "react"
import { cva, cx, type VariantProps } from "../lib/cva"

const boxVariants = cva({
  base: "border duration-100 ease-out outline-transparent",

  variants: {
    hover: {
      true: "not-disabled:cursor-pointer hover:not-disabled:outline-[3px] hover:not-disabled:outline-border/50 hover:not-disabled:border-ring",
    },
    focus: {
      true: "focus-visible:outline-[3px] focus-visible:outline-border/50 focus-visible:border-ring",
    },
    focusWithin: {
      true: "focus-within:outline-[3px] focus-within:outline-border/50 focus-within:border-ring",
    },
  },
})

type BoxProps = ComponentProps<"div"> & VariantProps<typeof boxVariants>

const Box = ({ hover, focus, focusWithin, className, ...props }: BoxProps) => {
  return (
    <Slot.Root className={cx(boxVariants({ hover, focus, focusWithin, className }))} {...props} />
  )
}

export { Box, boxVariants, type BoxProps }
