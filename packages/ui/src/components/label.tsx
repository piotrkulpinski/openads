"use client"

import { Label as LabelPrimitive } from "radix-ui"
import type { ComponentProps } from "react"
import { type VariantProps, cva, cx } from "../lib/cva"

const labelVariants = cva({
  base: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
})

const Label = ({
  className,
  ...props
}: ComponentProps<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>) => (
  <LabelPrimitive.Root className={cx(labelVariants(), className)} {...props} />
)

export { Label }
