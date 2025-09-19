import type { ComponentProps } from "react"
import { cx } from "../lib/cva"

const Overlay = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    className={cx(
      "fixed inset-0 z-50 bg-dashed backdrop-blur-xs",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
      className,
    )}
    {...props}
  />
)

export { Overlay }
