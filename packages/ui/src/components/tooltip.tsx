"use client"

import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import type { ComponentProps, ReactNode } from "react"
import { popoverAnimationClasses } from "../lib/classes"
import { cx } from "../lib/cva"

const TooltipProvider = TooltipPrimitive.Provider
const TooltipRoot = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger
const TooltipPortal = TooltipPrimitive.Portal
const TooltipArrow = TooltipPrimitive.Arrow

const TooltipContent = ({
  className,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) => {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cx(
          "z-50 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground will-change-[transform,opacity]",
          popoverAnimationClasses,
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
}

type TooltipProps = ComponentProps<typeof TooltipPrimitive.Root> &
  ComponentProps<typeof TooltipContent> & {
    tooltip: ReactNode
  }

const TooltipBase = ({ children, className, delayDuration, tooltip, ...rest }: TooltipProps) => {
  if (!tooltip) {
    return children
  }

  return (
    <TooltipRoot delayDuration={delayDuration}>
      <TooltipTrigger className={className} asChild>
        {children}
      </TooltipTrigger>

      <TooltipPortal>
        <TooltipContent {...rest}>
          {tooltip}
          <TooltipArrow className="fill-primary" />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  )
}

const Tooltip = Object.assign(TooltipBase, {
  Provider: TooltipProvider,
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Portal: TooltipPortal,
  Content: TooltipContent,
  Arrow: TooltipArrow,
})

export { Tooltip, TooltipRoot, TooltipTrigger, TooltipContent, TooltipProvider }
