import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import { LoaderIcon } from "lucide-react"
import { z } from "zod"
import { EmbedBooking } from "~/components/embed/embed-booking"
import { QueryCell } from "~/components/query-cell"
import { Logo } from "~/components/ui/logo"
import { Stack } from "~/components/ui/stack"
import { BookingProvider } from "~/contexts/booking-context"
import { trpc } from "~/lib/trpc"

export const Route = createFileRoute("/embed")({
  validateSearch: z.object({
    workspaceId: z.string().default(""),
    spotIds: z.string().default(""),
    theme: z.enum(["auto", "light", "dark"]).catch("auto"),
    layout: z.enum(["default", "grid"]).catch("default"),
  }),

  search: {
    middlewares: [stripSearchParams({ spotIds: "", theme: "auto", layout: "default" })],
  },

  component: SpotEmbed,
})

function SpotEmbed() {
  const { workspaceId, spotIds, theme, layout } = Route.useSearch()

  // useEffect(() => {
  //   // Send resize message to parent
  //   const sendSize = () => {
  //     const height = document.body.scrollHeight
  //     window.parent?.postMessage({ type: "resize", height }, "*")
  //   }

  //   const observer = new ResizeObserver(sendSize)
  //   observer.observe(document.body)

  //   return () => observer.disconnect()
  // }, [])

  const spotsQuery = trpc.spot.public.getAll.useQuery({ workspaceId }, { enabled: !!workspaceId })

  return (
    <>
      <QueryCell
        query={spotsQuery}
        pending={() => <LoaderIcon className="animate-spin mx-auto mt-[5vh]" />}
        error={() => (
          <p className="text-red-500 text-center">There was an error loading the ad spots.</p>
        )}
        empty={() => (
          <p className="text-muted-foreground text-center">
            No ad spots added for this workspace yet.
          </p>
        )}
        success={({ data }) => (
          <BookingProvider spots={data}>
            <EmbedBooking />
          </BookingProvider>
        )}
      />

      {/* add powered by logo */}
      <Stack
        size="sm"
        className="justify-center mt-4 text-center opacity-80 duration-200 hover:opacity-100 md:mt-6"
        asChild
      >
        {/* TODO: Update URL */}
        <a href={window.location.href}>
          <span className="text-xs text-muted-foreground">Powered by</span>
          <Logo className="h-4 w-auto" />
        </a>
      </Stack>
    </>
  )
}
