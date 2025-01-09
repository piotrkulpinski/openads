import { cx } from "@openads/ui/cva"
import type { ComponentProps } from "react"

export const Nav = ({ className, ...props }: ComponentProps<"nav">) => {
  return (
    <nav
      className={cx(
        "flex flex-col gap-1 p-3 group-data-[collapsed=true]/collapsible:justify-center group-data-[collapsed=true]/collapsible:px-2",
        className,
      )}
      {...props}
    />
  )
}
