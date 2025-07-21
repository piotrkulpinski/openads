import { Button } from "@openads/ui/button"
import { Skeleton } from "@openads/ui/skeleton"
import { createFileRoute, Link } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"
import { BookingItem } from "~/components/bookings/booking-item"
import { QueryCell } from "~/components/query-cell"
import { H3 } from "~/components/ui/heading"
import { Stack } from "~/components/ui/stack"
import { trpc } from "~/lib/trpc"

export const Route = createFileRoute("/$workspace/bookings/")({
  component: BookingsIndexPage,
})

function BookingsIndexPage() {
  const { workspace } = Route.useRouteContext()
  const bookingsQuery = trpc.booking.getAll.useQuery({ workspaceId: workspace.id })

  return (
    <>
      <Stack className="justify-between">
        <H3>Bookings</H3>

        <Button prefix={<PlusIcon />} className="-my-1" asChild>
          <Link to="/$workspace/bookings/new" params={{ workspace: workspace.slug }}>
            Create Booking
          </Link>
        </Button>
      </Stack>

      <QueryCell
        query={bookingsQuery}
        pending={() => [...Array(3)].map((_, i) => <Skeleton key={i} className="h-10" />)}
        error={() => <p className="text-red-500">There was an error loading the bookings.</p>}
        empty={() => (
          <p className="text-muted-foreground">No bookings scheduled for this workspace yet.</p>
        )}
        success={({ data }) => (
          <div className="flex flex-col border rounded-lg divide-y">
            {data.map(booking => (
              <BookingItem key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      />
    </>
  )
}
