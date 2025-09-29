import { Stack } from "@openads/ui/stack"
import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import { LoaderIcon } from "lucide-react"
import { z } from "zod"
import { EmbedCampaign } from "~/components/embed/embed-campaign"
import { QueryCell } from "~/components/query-cell"
import { Logo } from "~/components/ui/logo"
import { CampaignProvider } from "~/contexts/campaign-context"
import { trpc } from "~/lib/trpc"

const defaultValues = {
  workspaceId: "",
  zoneIds: "",
  theme: "auto",
  layout: "default",
} as const

export const Route = createFileRoute("/embed")({
  validateSearch: z.object({
    workspaceId: z.string().default(defaultValues.workspaceId),
    zoneIds: z.string().default(defaultValues.zoneIds),
    theme: z.enum(["auto", "light", "dark"]).catch(defaultValues.theme),
    layout: z.enum(["default", "grid"]).catch(defaultValues.layout),
  }),

  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },

  component: ZoneEmbed,
})

function ZoneEmbed() {
  const { workspaceId } = Route.useSearch()

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

  const zonesQuery = trpc.zone.public.getAll.useQuery({ workspaceId }, { enabled: !!workspaceId })

  if (!workspaceId) {
    return (
      <div className="h-screen grid place-items-center">
        <p className="text-muted-foreground text-center">No workspace ID provided.</p>
      </div>
    )
  }

  return (
    <>
      <QueryCell
        query={zonesQuery}
        pending={() => <LoaderIcon className="animate-spin mx-auto mt-[5vh]" />}
        error={() => (
          <p className="text-red-500 text-center">There was an error loading the ad zones.</p>
        )}
        empty={() => (
          <p className="text-muted-foreground text-center">
            No ad zones added for this workspace yet.
          </p>
        )}
        success={({ data }) => (
          <CampaignProvider zones={data}>
            <EmbedCampaign />
          </CampaignProvider>
        )}
      />

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
