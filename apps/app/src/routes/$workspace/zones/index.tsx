import { Button } from "@openads/ui/button"
import { Skeleton } from "@openads/ui/skeleton"
import { createFileRoute, Link } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"
import { QueryCell } from "~/components/query-cell"
import { Header, HeaderActions, HeaderTitle } from "~/components/ui/header"
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
      <Header>
        <HeaderTitle>Ad Zones</HeaderTitle>

        <HeaderActions>
          <Button prefix={<PlusIcon />} asChild>
            <Link to="/$workspace/zones/new" params={{ workspace: workspace.slug }}>
              Create Zone
            </Link>
          </Button>
        </HeaderActions>
      </Header>

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
