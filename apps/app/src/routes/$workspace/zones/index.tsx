import { Button } from "@openads/ui/button"
import { Skeleton } from "@openads/ui/skeleton"
import { Stack } from "@openads/ui/stack"
import { createFileRoute, Link } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"
import { QueryCell } from "~/components/query-cell"
import { H3 } from "~/components/ui/heading"
import { ZoneItem } from "~/components/zones/zone-item"
import { trpc } from "~/lib/trpc"

export const Route = createFileRoute("/$workspace/zones/")({
  component: ZonesIndexPage,
})

function ZonesIndexPage() {
  const { workspace } = Route.useRouteContext()
  const zonesQuery = trpc.zone.getAll.useQuery({ workspaceId: workspace.id })

  return (
    <>
      <Stack className="justify-between">
        <H3>Ad Zones</H3>

        <Button prefix={<PlusIcon />} className="-my-1" asChild>
          <Link to="/$workspace/zones/new" params={{ workspace: workspace.slug }}>
            Create Zone
          </Link>
        </Button>
      </Stack>

      <QueryCell
        query={zonesQuery}
        pending={() => [...Array(3)].map((_, i) => <Skeleton key={i} className="h-10" />)}
        error={() => <p className="text-red-500">There was an error loading the ad zones.</p>}
        empty={() => (
          <p className="text-muted-foreground">No ad zones added for this workspace yet.</p>
        )}
        success={({ data }) => (
          <div className="flex flex-col border rounded-lg divide-y">
            {data.map(zone => (
              <ZoneItem key={zone.id} zone={zone} />
            ))}
          </div>
        )}
      />
    </>
  )
}
