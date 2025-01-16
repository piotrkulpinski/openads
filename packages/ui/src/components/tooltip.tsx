"use client"

import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import type { ComponentProps, ReactNode } from "react"
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
          "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
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
          <TooltipArrow className="fill-foreground" />
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
