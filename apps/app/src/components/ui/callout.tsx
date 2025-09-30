import { cva, cx, type VariantProps } from "@openads/ui/cva"
import { Stack } from "@openads/ui/stack"
import { Slot } from "radix-ui"
import type { ComponentProps } from "react"
import { Prose } from "~/components/ui/prose"

const calloutVariants = cva({
  base: "w-full rounded-lg border px-3.5 py-2.5 **:[&[href]]:underline **:[&[href]]:underline-offset-2 **:[&[href]]:hover:text-foreground",

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

type CalloutProps = ComponentProps<typeof Stack> & VariantProps<typeof calloutVariants>

const Callout = ({ className, variant, ...props }: CalloutProps) => (
  <Stack
    size="sm"
    role="alert"
    wrap={false}
    className={cx(calloutVariants({ variant }), className)}
    {...props}
  />
)

const CalloutText = ({ className, ...props }: ComponentProps<typeof Prose>) => (
  <Prose className={cx("font-medium text-current", className)} {...props} />
)

const CalloutIcon = ({ className, ...props }: ComponentProps<typeof Slot.Root>) => (
  <Slot.Root className={cx("mt-0.5 self-start shrink-0", className)} {...props} />
)

export { Callout, CalloutText, CalloutIcon }
