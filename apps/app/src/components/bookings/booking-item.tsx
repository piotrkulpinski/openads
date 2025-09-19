import { Badge } from "@openads/ui/badge"
import { cx } from "@openads/ui/cva"
import { formatDateRange } from "@primoui/utils"
import { Link } from "@tanstack/react-router"
import type { ComponentProps } from "react"
import type { RouterOutputs } from "~/lib/trpc"

type BookingItemProps = ComponentProps<typeof Link> & {
  booking: RouterOutputs["booking"]["getAll"][number]
}

export function BookingItem({ booking, className, ...props }: BookingItemProps) {
  const statusColor = {
    pending: "bg-blue-50 dark:bg-blue-950",
    paid: "bg-green-50 dark:bg-green-950",
    cancelled: "bg-red-50 dark:bg-red-950",
    refunded: "bg-orange-50 dark:bg-orange-950",
  }[booking.status]

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

        <Badge size="sm" variant="soft" className={cx("capitalize", statusColor)}>
          {booking.status}
        </Badge>
      </div>
    </Link>
  )
}
