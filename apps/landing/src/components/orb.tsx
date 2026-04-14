import { cx } from "@openads/ui/cva"
import type { ComponentProps } from "react"

export function Orb({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cx("w-150 h-100 md:w-225 md:h-150 pointer-events-none", className)} {...props}>
      <div className="absolute inset-0 rounded-full bg-[#10b981]/12 blur-[100px]" />
      <div className="absolute inset-[15%] rounded-full bg-[#34d399]/10 blur-[60px]" />
      <div className="absolute inset-[35%] rounded-full bg-[#6ee7b7]/8 blur-2xl" />
    </div>
  )
}
