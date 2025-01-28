"use client"

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import type { ComponentProps } from "react"
import { Modal } from "../components/modal"
import { cx } from "../lib/cva"
import { Button, buttonVariants } from "./button"

const AlertDialog = AlertDialogPrimitive.Root
const AlertDialogTrigger = AlertDialogPrimitive.Trigger
const AlertDialogPortal = AlertDialogPrimitive.Portal
const AlertDialogDescription = AlertDialogPrimitive.Description

const AlertDialogOverlay = ({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Overlay>) => (
  <AlertDialogPrimitive.Overlay
    className={cx(
      "fixed inset-0 z-50 bg-background/60 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
      className,
    )}
    {...props}
  />
)

const AlertDialogContent = ({
  className,
  size = "sm",
  fixed,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Content> & ComponentProps<typeof Modal>) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />

    <Modal size={size} fixed={fixed} asChild>
      <AlertDialogPrimitive.Content
        className={cx(
          "grid gap-6 border bg-background p-6 shadow-sm rounded-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:slide-out-to-bottom-4",
          className,
        )}
        {...props}
      />
    </Modal>
  </AlertDialogPortal>
)

const AlertDialogHeader = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cx("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)

const AlertDialogFooter = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    className={cx("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
)

const AlertDialogTitle = ({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Title>) => (
  <AlertDialogPrimitive.Title className={cx("text-lg font-semibold", className)} {...props} />
)

const AlertDialogAction = ({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Action>) => (
  <AlertDialogPrimitive.Action className={cx(buttonVariants(), className)} {...props} />
)

const AlertDialogCancel = ({ className, ...props }: ComponentProps<typeof Button>) => (
  <AlertDialogPrimitive.Cancel asChild>
    <Button variant="outline" size="sm" {...props} />
  </AlertDialogPrimitive.Cancel>
)

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
