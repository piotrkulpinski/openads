import { cva, cx, type VariantProps } from "@openads/ui/cva"
import { Stack } from "@openads/ui/stack"
import { Slot } from "radix-ui"
import type { ComponentProps, ReactNode } from "react"
import { Prose } from "~/components/ui/prose"

const calloutVariants = cva({
  base: "w-full rounded-lg border px-3.5 py-2.5",

  variants: {
    variant: {
      default: "bg-muted text-secondary-foreground",
      info: "bg-sky-700/5 border-sky-700/20 text-sky-700/90 dark:bg-sky-300/10 dark:border-sky-300/20 dark:text-sky-300/90",
      warning:
        "bg-amber-700/5 border-amber-700/20 text-amber-700/90 dark:bg-amber-300/10 dark:border-amber-300/20 dark:text-amber-300/90",
      success:
        "bg-green-700/5 border-green-700/20 text-green-700/90 dark:bg-green-300/10 dark:border-green-300/20 dark:text-green-300/90",
      danger:
        "bg-red-700/5 border-red-700/20 text-red-700/90 dark:bg-red-300/10 dark:border-red-300/20 dark:text-red-300/90",
    },
  },

  defaultVariants: {
    variant: "default",
  },
})

type CalloutProps = Omit<ComponentProps<typeof Stack>, "prefix" | "suffix"> &
  VariantProps<typeof calloutVariants> & {
    /**
     * The slot to be rendered before the content.
     */
    prefix?: ReactNode

    /**
     * The slot to be rendered after the content.
     */
    suffix?: ReactNode
  }

const Callout = ({ children, className, variant, prefix, suffix, ...props }: CalloutProps) => (
  <Stack
    size="sm"
    wrap={false}
    role="alert"
    className={cx(calloutVariants({ variant }), className)}
    {...props}
  >
    <Slot.Root className="mt-0.5 self-start shrink-0 size-4.5">{prefix}</Slot.Root>
    {children}
    <Slot.Root className="mt-0.5 self-start shrink-0 size-4.5">{suffix}</Slot.Root>
  </Stack>
)

const CalloutText = ({ className, ...props }: ComponentProps<typeof Prose>) => (
  <Prose className={cx("font-medium text-current", className)} {...props} />
)

export { Callout, CalloutText }
