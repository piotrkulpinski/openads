"use client"

import { CheckIcon, ChevronRightIcon, DotFilledIcon } from "@radix-ui/react-icons"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import type { ComponentProps } from "react"
import { cx } from "../lib/cva"

const MenubarMenu = MenubarPrimitive.Menu

const MenubarGroup = MenubarPrimitive.Group

const MenubarPortal = MenubarPrimitive.Portal

const MenubarSub = MenubarPrimitive.Sub

const MenubarRadioGroup = MenubarPrimitive.RadioGroup

const Menubar = ({ className, ...props }: ComponentProps<typeof MenubarPrimitive.Root>) => (
  <MenubarPrimitive.Root
    className={cx(
      "flex h-9 items-center space-x-1 rounded-md border bg-background p-1 shadow-xs",
      className,
    )}
    {...props}
  />
)

const MenubarTrigger = ({
  className,
  ...props
}: ComponentProps<typeof MenubarPrimitive.Trigger>) => (
  <MenubarPrimitive.Trigger
    className={cx(
      "flex cursor-default select-none items-center rounded-xs px-3 py-1 text-sm font-medium outline-hidden focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      className,
    )}
    {...props}
  />
)

const MenubarSubTrigger = ({
  className,
  inset,
  children,
  ...props
}: ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean
}) => (
  <MenubarPrimitive.SubTrigger
    className={cx(
      "flex cursor-default select-none items-center rounded-xs px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRightIcon className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
)

const MenubarSubContent = ({
  className,
  ...props
}: ComponentProps<typeof MenubarPrimitive.SubContent>) => (
  <MenubarPrimitive.SubContent
    className={cx(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
)

const MenubarContent = ({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: ComponentProps<typeof MenubarPrimitive.Content>) => (
  <MenubarPrimitive.Portal>
    <MenubarPrimitive.Content
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={cx(
        "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </MenubarPrimitive.Portal>
)

const MenubarItem = ({
  className,
  inset,
  ...props
}: ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean
}) => (
  <MenubarPrimitive.Item
    className={cx(
      "relative flex cursor-default select-none items-center rounded-xs px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
)

const MenubarCheckboxItem = ({
  className,
  children,
  checked,
  ...props
}: ComponentProps<typeof MenubarPrimitive.CheckboxItem>) => (
  <MenubarPrimitive.CheckboxItem
    className={cx(
      "relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
)

const MenubarRadioItem = ({
  className,
  children,
  ...props
}: ComponentProps<typeof MenubarPrimitive.RadioItem>) => (
  <MenubarPrimitive.RadioItem
    className={cx(
      "relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <DotFilledIcon className="h-4 w-4 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
)

const MenubarLabel = ({
  className,
  inset,
  ...props
}: ComponentProps<typeof MenubarPrimitive.Label> & {
  inset?: boolean
}) => (
  <MenubarPrimitive.Label
    className={cx("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
    {...props}
  />
)

const MenubarSeparator = ({
  className,
  ...props
}: ComponentProps<typeof MenubarPrimitive.Separator>) => (
  <MenubarPrimitive.Separator className={cx("-mx-1 my-1 h-px bg-muted", className)} {...props} />
)

const MenubarShortcut = ({ className, ...props }: ComponentProps<"span">) => (
  <span
    className={cx("ml-auto text-xs tracking-widest text-muted-foreground", className)}
    {...props}
  />
)

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
}
