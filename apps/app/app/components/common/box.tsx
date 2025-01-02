import { Slot } from "@radix-ui/react-slot"
import type { ComponentProps } from "react"
import { type VariantProps, cva, cx } from "~/utils/cva"

export const boxVariants = cva({
  base: "border",

  variants: {
    hover: {
      true: "enabled:cursor-pointer hover:ring-[3px] hover:ring-foreground/10 hover:border-foreground/25",
    },
    focus: {
      true: "focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-foreground/10 focus-visible:border-foreground/25 focus-visible:z-10",
    },
    focusWithin: {
      true: "focus-within:outline-hidden focus-within:ring-[3px] focus-within:ring-foreground/10 focus-within:border-foreground/25 focus-within:z-10",
    },
  },
})

export type BoxProps = ComponentProps<"div"> & VariantProps<typeof boxVariants>

export const Box = ({ hover, focus, focusWithin, className, ...props }: BoxProps) => {
  return <Slot className={cx(boxVariants({ hover, focus, focusWithin, className }))} {...props} />
}
