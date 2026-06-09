"use client"

import { Tooltip as TooltipPrimitive } from "radix-ui"
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
          "z-50 max-w-60 inline-flex items-center gap-2 px-3 py-1.5 bg-foreground text-xs text-background text-center text-pretty rounded-md will-change-[transform,opacity]",
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

const Tooltip = ({
  children,
  tooltip,
  open,
  defaultOpen,
  onOpenChange,
  delayDuration,
  disableHoverableContent,
  ...rest
}: TooltipProps) => {
  if (!tooltip) {
    return children
  }

  return (
    <TooltipRoot
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      delayDuration={delayDuration}
      disableHoverableContent={disableHoverableContent}
    >
      <TooltipTrigger asChild>{children}</TooltipTrigger>

      <TooltipPortal>
        <TooltipContent {...rest}>
          {tooltip}
          <TooltipArrow className="fill-foreground" />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  )
}

export { Tooltip, TooltipRoot, TooltipTrigger, TooltipContent, TooltipProvider }
