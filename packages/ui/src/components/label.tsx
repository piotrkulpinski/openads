"use client"

import * as LabelPrimitive from "@radix-ui/react-label"
import type { ComponentProps } from "react"
import { type VariantProps, cva, cx } from "../lib/utils"

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
