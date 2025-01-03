"use client"

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import * as React from "react"
import type { ComponentProps } from "react"
import { type VariantProps, cx } from "../lib/utils"
import { toggleVariants } from "./toggle"

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: "default",
  variant: "default",
})

type ToggleGroupProps = ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants>

const ToggleGroup = ({ className, variant, size, children, ...props }: ToggleGroupProps) => {
  return (
    <ToggleGroupPrimitive.Root
      className={cx("flex items-center justify-center gap-1", className)}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

type ToggleGroupItemProps = ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>

const ToggleGroupItem = ({ className, variant, size, ...props }: ToggleGroupItemProps) => {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      className={cx(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
