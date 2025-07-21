import { cx } from "@openads/ui/cva"
import { formatDateRange } from "@primoui/utils"
import { Link } from "@tanstack/react-router"
import type { ComponentProps } from "react"
import type { RouterOutputs } from "~/lib/trpc"

type BookingItemProps = ComponentProps<typeof Link> & {
  booking: RouterOutputs["booking"]["getAll"][number]
}

export function BookingItem({ booking, className, ...props }: BookingItemProps) {
  return (
    <Link
      to={booking.id}
      from="/$workspace/bookings"
      className={cx("flex items-center justify-between px-4 py-3 hover:bg-muted/50", className)}
      {...props}
    >
      <div className="space-y-1">
        <p className="font-medium">{booking.spot.name}</p>
        <p className="text-sm text-muted-foreground">
          {formatDateRange(booking.startsAt, booking.endsAt)}
        </p>
      </div>

      <div className="text-right">
        <p className="font-medium">${booking.amount / 100}</p>
        <p className="text-sm text-muted-foreground capitalize">{booking.status}</p>
      </div>
    </Link>
  )
}
