"use client"

import { XIcon } from "lucide-react"
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"
import type { ComponentProps } from "react"
import { Modal } from "../components/modal"
import { cx } from "../lib/cva"
import { Button } from "./button"
import { Overlay } from "./overlay"

const AlertDialog = AlertDialogPrimitive.Root
const AlertDialogTrigger = AlertDialogPrimitive.Trigger
const AlertDialogPortal = AlertDialogPrimitive.Portal
const AlertDialogDescription = AlertDialogPrimitive.Description

const AlertDialogOverlay = ({ ...props }: ComponentProps<typeof Overlay>) => (
  <AlertDialogPrimitive.Overlay asChild>
    <Overlay {...props} />
  </AlertDialogPrimitive.Overlay>
)

const AlertDialogContent = ({
  children,
  className,
  size = "sm",
  fixed,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Content> & ComponentProps<typeof Modal>) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />

    <Modal size={size} fixed={fixed} asChild>
      <AlertDialogPrimitive.Content
        onOpenAutoFocus={e => e.preventDefault()}
        className={cx(
          "grid gap-6 border bg-background p-6 shadow-sm rounded-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:slide-out-to-bottom-4",
          className,
        )}
        {...props}
      >
        {children}

        <AlertDialogPrimitive.Cancel className="absolute right-4 top-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <XIcon className="size-5" />
          <span className="sr-only">Close</span>
        </AlertDialogPrimitive.Cancel>
      </AlertDialogPrimitive.Content>
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

const AlertDialogAction = ({ ...props }: ComponentProps<typeof Button>) => (
  <AlertDialogPrimitive.Action asChild>
    <Button {...props} />
  </AlertDialogPrimitive.Action>
)

const AlertDialogCancel = ({ ...props }: ComponentProps<typeof Button>) => (
  <AlertDialogPrimitive.Cancel asChild>
    <Button variant="secondary" {...props} />
  </AlertDialogPrimitive.Cancel>
)

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
