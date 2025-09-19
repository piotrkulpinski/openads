"use client"

import { XIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import type { ComponentProps } from "react"
import { Modal } from "../components/modal"
import { cx } from "../lib/cva"
import { Button } from "./button"
import { Overlay } from "./overlay"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogTitle = DialogPrimitive.Title
const DialogDescription = DialogPrimitive.Description

const DialogOverlay = ({ className, ...props }: ComponentProps<typeof DialogPrimitive.Overlay>) => (
  <DialogPrimitive.Overlay asChild>
    <Overlay />
  </DialogPrimitive.Overlay>
)

const DialogContent = ({
  className,
  children,
  size = "md",
  fixed,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & ComponentProps<typeof Modal>) => (
  <DialogPortal>
    <DialogOverlay />

    <Modal size={size} fixed={fixed} asChild>
      <DialogPrimitive.Content
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

        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <XIcon className="size-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </Modal>
  </DialogPortal>
)

const DialogHeader = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cx("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)

const DialogFooter = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    className={cx(
      "flex flex-col-reverse flex-wrap gap-x-2 gap-y-4 sm:flex-row sm:justify-end",
      className,
    )}
    {...props}
  />
)

const DialogClose = ({ ...props }: ComponentProps<typeof Button>) => (
  <DialogPrimitive.Close asChild>
    <Button variant="secondary" {...props} />
  </DialogPrimitive.Close>
)

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
