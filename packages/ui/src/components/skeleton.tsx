import type { ComponentProps } from "react"
import { cx } from "../lib/cva"

export const Skeleton = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cx("animate-pulse rounded-md bg-primary/10", className)} {...props} />
)
