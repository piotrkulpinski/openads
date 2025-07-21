import type * as React from "react"
import { cva, cx, type VariantProps } from "../lib/cva"

const badgeVariants = cva({
  base: "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
  variants: {
    variant: {
      default:
        "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/80",
      secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      success: "border-transparent bg-green-500/75 text-background hover:bg-green-500/85",
      destructive:
        "border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/80",
      outline: "text-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cx(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
