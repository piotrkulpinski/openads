"use client"

import type { ComponentProps } from "react"
import { Drawer as DrawerPrimitive } from "vaul"
import { cx } from "../lib/utils"

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
)

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = ({ className, ...props }: ComponentProps<typeof DrawerPrimitive.Overlay>) => (
  <DrawerPrimitive.Overlay className={cx("fixed inset-0 z-50 bg-black/80", className)} {...props} />
)

const DrawerContent = ({
  className,
  children,
  ...props
}: ComponentProps<typeof DrawerPrimitive.Content>) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      className={cx(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className,
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
)

const DrawerHeader = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cx("grid gap-1.5 p-4 text-center sm:text-left", className)} {...props} />
)

const DrawerFooter = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cx("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
)

const DrawerTitle = ({ className, ...props }: ComponentProps<typeof DrawerPrimitive.Title>) => (
  <DrawerPrimitive.Title
    className={cx("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
)

const DrawerDescription = ({
  className,
  ...props
}: ComponentProps<typeof DrawerPrimitive.Description>) => (
  <DrawerPrimitive.Description
    className={cx("text-sm text-muted-foreground", className)}
    {...props}
  />
)

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
