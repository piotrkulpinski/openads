import { createFileRoute, notFound } from "@tanstack/react-router"
import { BookingForm } from "~/components/bookings/booking-form"
import { H3 } from "~/components/ui/heading"

export const Route = createFileRoute("/$workspace/bookings/$bookingId")({
  loader: async ({ context: { trpcUtils, workspace }, params: { bookingId } }) => {
    const booking = await trpcUtils.booking.getById.fetch({
      id: bookingId,
      workspaceId: workspace.id,
    })

    if (!booking) {
      throw notFound()
    }

    return { booking }
  },

  component: BookingsEditPage,
})

function BookingsEditPage() {
  const { workspace } = Route.useRouteContext()
  const { booking } = Route.useLoaderData()

  return (
    <>
      <H3>Edit Booking</H3>

      <BookingForm
        workspaceId={workspace.id}
        booking={booking}
        nextUrl={{ from: Route.fullPath, to: ".." }}
        className="mt-4"
      />
    </>
  )
}
