import type { ComponentProps } from "react"

export function Container({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`max-w-6xl mx-auto px-6 md:px-8 ${className}`} {...props} />
}
