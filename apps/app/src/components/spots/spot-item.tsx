import { cx } from "@openads/ui/cva"
import { Link } from "@tanstack/react-router"
import type { HTMLAttributes } from "react"
import { H5 } from "~/components/ui/heading"
import type { RouterOutputs } from "~/lib/trpc"

type SpotItemProps = HTMLAttributes<HTMLDivElement> & {
  spot: RouterOutputs["spot"]["getAll"][number]
}

const SpotItem = ({ spot, ...props }: SpotItemProps) => {
  return (
    <div className={cx("flex items-center justify-between px-4 py-3", props.className)}>
      <Link to={spot.id} from="/$workspace/spots">
        <H5 className="truncate">{spot.name}</H5>
      </Link>
    </div>
  )
}

export { SpotItem }
