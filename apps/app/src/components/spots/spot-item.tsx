import { cx } from "@openads/ui/cva"
import { Link } from "@tanstack/react-router"
import type { ComponentProps } from "react"
import { H5 } from "~/components/ui/heading"
import type { RouterOutputs } from "~/lib/trpc"

type SpotItemProps = ComponentProps<typeof Link> & {
  spot: RouterOutputs["spot"]["getAll"][number]
}

const SpotItem = ({ spot, className, ...props }: SpotItemProps) => {
  return (
    <Link
      to={spot.id}
      from="/$workspace/spots"
      className={cx("flex items-center justify-between px-4 py-3 hover:bg-muted/50", className)}
      {...props}
    >
      <H5 className="truncate">{spot.name}</H5>
    </Link>
  )
}

export { SpotItem }
