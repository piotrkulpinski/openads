import type * as React from "react"
import { cva, cx, type VariantProps } from "../lib/cva"

const badgeVariants = cva({
  base: "inline-flex items-center border font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
  variants: {
    variant: {
      default:
        "border-transparent bg-primary text-primary-foreground shadow-sm hover:[&[href],&[type]]:bg-primary/80",
      secondary:
        "border-transparent bg-secondary text-secondary-foreground hover:[&[href],&[type]]:bg-secondary/80",
      success:
        "border-transparent bg-green-500/75 text-background hover:[&[href],&[type]]:bg-green-500/85",
      destructive:
        "border-transparent bg-destructive text-white shadow-sm hover:[&[href],&[type]]:bg-destructive/80",
      outline: "text-foreground",
    },
    size: {
      sm: "px-1 py-px gap-1 text-[0.625rem] rounded-sm",
      md: "px-1.5 py-0.5 gap-1.5 text-xs rounded-sm",
      lg: "px-2 py-1 gap-2 text-sm rounded-md",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cx(badgeVariants({ variant, size }), className)} {...props} />
}

export { Badge, badgeVariants }
