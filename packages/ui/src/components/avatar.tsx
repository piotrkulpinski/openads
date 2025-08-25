"use client"

import { Avatar as AvatarPrimitive } from "radix-ui"
import type { ComponentProps } from "react"
import { cx } from "../lib/cva"

const Avatar = ({ className, ...props }: ComponentProps<typeof AvatarPrimitive.Root>) => (
  <AvatarPrimitive.Root
    className={cx("relative flex size-10 shrink-0 overflow-hidden rounded-md", className)}
    {...props}
  />
)

const AvatarImage = ({ className, ...props }: ComponentProps<typeof AvatarPrimitive.Image>) => (
  <AvatarPrimitive.Image className={cx("aspect-square size-full", className)} {...props} />
)

const AvatarFallback = ({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Fallback>) => (
  <AvatarPrimitive.Fallback
    className={cx("flex size-full items-center justify-center rounded-md bg-muted", className)}
    {...props}
  />
)

export { Avatar, AvatarFallback, AvatarImage }
