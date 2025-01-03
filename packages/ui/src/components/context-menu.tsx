"use client"

import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
import { CheckIcon, ChevronRightIcon, DotFilledIcon } from "@radix-ui/react-icons"
import type { ComponentProps } from "react"
import { cx } from "../lib/utils"

const ContextMenu = ContextMenuPrimitive.Root

const ContextMenuTrigger = ContextMenuPrimitive.Trigger

const ContextMenuGroup = ContextMenuPrimitive.Group

const ContextMenuPortal = ContextMenuPrimitive.Portal

const ContextMenuSub = ContextMenuPrimitive.Sub

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

const ContextMenuSubTrigger = ({
  className,
  inset,
  children,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) => (
  <ContextMenuPrimitive.SubTrigger
    className={cx(
      "flex cursor-default select-none items-center rounded-xs px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRightIcon className="ml-auto h-4 w-4" />
  </ContextMenuPrimitive.SubTrigger>
)

const ContextMenuSubContent = ({
  className,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.SubContent>) => (
  <ContextMenuPrimitive.SubContent
    className={cx(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
)

const ContextMenuContent = ({
  className,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Content>) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      className={cx(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
)

const ContextMenuItem = ({
  className,
  inset,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean
}) => (
  <ContextMenuPrimitive.Item
    className={cx(
      "relative flex cursor-default select-none items-center rounded-xs px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
)

const ContextMenuCheckboxItem = ({
  className,
  children,
  checked,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) => (
  <ContextMenuPrimitive.CheckboxItem
    className={cx(
      "relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
)

const ContextMenuRadioItem = ({
  className,
  children,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.RadioItem>) => (
  <ContextMenuPrimitive.RadioItem
    className={cx(
      "relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <DotFilledIcon className="h-4 w-4 fill-current" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
)

const ContextMenuLabel = ({
  className,
  inset,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean
}) => (
  <ContextMenuPrimitive.Label
    className={cx("px-2 py-1.5 text-sm font-semibold text-foreground", inset && "pl-8", className)}
    {...props}
  />
)

const ContextMenuSeparator = ({
  className,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Separator>) => (
  <ContextMenuPrimitive.Separator
    className={cx("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
)

const ContextMenuShortcut = ({ className, ...props }: ComponentProps<"span">) => (
  <span
    className={cx("ml-auto text-xs tracking-widest text-muted-foreground", className)}
    {...props}
  />
)

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
