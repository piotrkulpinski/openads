import { formatDateRange } from "@curiousleaf/utils"
import { Link } from "@tanstack/react-router"
import type { RouterOutputs } from "~/lib/trpc"

type Booking = RouterOutputs["booking"]["getAll"][number]

interface BookingItemProps {
  booking: Booking
}

export function BookingItem({ booking }: BookingItemProps) {
  return (
    <Link
      to={booking.id}
      from="/$workspace/bookings"
      className="flex items-center justify-between px-4 py-3 hover:bg-muted/50"
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
