"use client"

import { CaretSortIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons"
import * as SelectPrimitive from "@radix-ui/react-select"
import type { ComponentProps } from "react"
import { cx } from "../lib/cva"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = ({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger>) => (
  <SelectPrimitive.Trigger
    className={cx(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <CaretSortIcon className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
)

const SelectScrollUpButton = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollUpButton>) => (
  <SelectPrimitive.ScrollUpButton
    className={cx("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronUpIcon />
  </SelectPrimitive.ScrollUpButton>
)

const SelectScrollDownButton = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollDownButton>) => (
  <SelectPrimitive.ScrollDownButton
    className={cx("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDownIcon />
  </SelectPrimitive.ScrollDownButton>
)

const SelectContent = ({
  className,
  children,
  position = "popper",
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      className={cx(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cx(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
)

const SelectLabel = ({ className, ...props }: ComponentProps<typeof SelectPrimitive.Label>) => (
  <SelectPrimitive.Label
    className={cx("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
)

const SelectItem = ({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) => (
  <SelectPrimitive.Item
    className={cx(
      "relative flex w-full cursor-default select-none items-center rounded-xs py-1.5 pl-2 pr-8 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
)

const SelectSeparator = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Separator>) => (
  <SelectPrimitive.Separator className={cx("-mx-1 my-1 h-px bg-muted", className)} {...props} />
)

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}