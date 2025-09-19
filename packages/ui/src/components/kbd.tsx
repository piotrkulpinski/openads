import type { ComponentProps } from "react"
import { cva, cx, type VariantProps } from "../lib/cva"

const kbdVariants = cva({
  base: "inline-flex gap-[0.1em] -my-0.5 px-[0.4em] py-[0.088em] whitespace-nowrap tabular-nums rounded-sm border text-xs/tight font-medium text-muted-foreground",

  variants: {
    variant: {
      soft: "border-transparent bg-accent",
      outline: "bg-background",
    },
  },

  defaultVariants: {
    variant: "outline",
  },
})

type KbdProps = ComponentProps<"span"> &
  VariantProps<typeof kbdVariants> & {
    meta?: boolean
    shift?: boolean
    alt?: boolean
    ctrl?: boolean
    className?: string
  }

export const Kbd = ({
  children,
  className,
  variant,
  meta,
  shift,
  alt,
  ctrl,
  ...props
}: KbdProps) => {
  return (
    <span className={cx(kbdVariants({ variant, className }))} {...props}>
      {shift && <span>⇧</span>}
      {meta && <span>⌘</span>}
      {alt && <span>⌥</span>}
      {ctrl && <span>⌃</span>}
      {children && <span>{children}</span>}
    </span>
  )
}
