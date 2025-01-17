import type { ComponentProps } from "react"
import { cx } from "../lib/cva"

export interface InputProps extends ComponentProps<"input"> {}

const Input = ({ className, type, ...props }: InputProps) => (
  <input
    type={type}
    className={cx(
      "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden not-read-only:focus-visible:ring-1 not-read-only:focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
)

export { Input }
