import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/advertise/cancelled")({
  component: AdvertiseCancelled,
})

function AdvertiseCancelled() {
  return (
    <div className="grid h-screen place-items-center px-6">
      <div className="grid place-items-center gap-3 text-center">
        <h1 className="font-semibold text-2xl">Checkout cancelled</h1>
        <p className="max-w-md text-muted-foreground text-sm">
          No payment was taken. You can close this window or go back to choose a different package.
        </p>
      </div>
    </div>
  )
}
