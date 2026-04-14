import { cx } from "@openads/ui/cva"
import type { ComponentProps } from "react"

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("max-w-6xl mx-auto px-6 md:px-8", className)} {...props} />
}
