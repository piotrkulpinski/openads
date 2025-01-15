import { Link } from "@tanstack/react-router"
import type { HTMLProps } from "react"
import { H5 } from "~/components/heading"
import type { RouterOutputs } from "~/lib/trpc"

type SpotItemProps = HTMLProps<HTMLDivElement> & {
  spot: RouterOutputs["spot"]["getAll"][number]
}

const SpotItem = ({ spot, ...props }: SpotItemProps) => {
  return (
    <Link to={spot.id}>
      <H5 className="truncate">{spot.name}</H5>
    </Link>
  )
}

export { SpotItem }
