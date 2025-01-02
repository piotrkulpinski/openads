import * as LabelPrimitive from "@radix-ui/react-label"
import type { ComponentProps } from "react"
import { type VariantProps, cva, cx } from "~/utils/cva"

const labelVariants = cva({
  base: "block self-start text-sm font-semibold text-foreground [&[for]]:cursor-pointer",

  variants: {
    isRequired: {
      true: "after:ml-0.5 after:text-red-500/75 after:content-['*']",
    },
  },
})

type LabelProps = ComponentProps<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>

export const Label = ({ className, isRequired, ...props }: LabelProps) => {
  return (
    <LabelPrimitive.Root
      className={cx(labelVariants({ isRequired, className }))}
      aria-label="Label"
      {...props}
    />
  )
}
