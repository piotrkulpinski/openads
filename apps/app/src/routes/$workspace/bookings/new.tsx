import { createFileRoute } from "@tanstack/react-router"
import { BookingForm } from "~/components/bookings/booking-form"
import { H3 } from "~/components/ui/heading"

export const Route = createFileRoute("/$workspace/bookings/new")({
  component: BookingsNewPage,
})

function BookingsNewPage() {
  const { workspace } = Route.useRouteContext()

  return (
    <>
      <H3>New Booking</H3>

      <BookingForm
        workspaceId={workspace.id}
        nextUrl={{ from: Route.fullPath, to: ".." }}
        className="mt-4"
      />
    </>
  )
}
