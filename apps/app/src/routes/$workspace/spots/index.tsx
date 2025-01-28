import { Button } from "@openads/ui/button"
import { Skeleton } from "@openads/ui/skeleton"
import { Link, createFileRoute } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"
import { QueryCell } from "~/components/query-cell"
import { SpotItem } from "~/components/spots/spot-item"
import { H3 } from "~/components/ui/heading"
import { Stack } from "~/components/ui/stack"
import { trpc } from "~/lib/trpc"

export const Route = createFileRoute("/$workspace/spots/")({
  component: SpotsIndexPage,
})

function SpotsIndexPage() {
  const { workspace } = Route.useRouteContext()
  const spotsQuery = trpc.spot.getAll.useQuery({ workspaceId: workspace.id })

  return (
    <>
      <Stack className="justify-between">
        <H3>Ad Spots</H3>

        <Button prefix={<PlusIcon />} className="-my-1" asChild>
          <Link to="/$workspace/spots/new" params={{ workspace: workspace.slug }}>
            Create Spot
          </Link>
        </Button>
      </Stack>

      <QueryCell
        query={spotsQuery}
        pending={() => [...Array(3)].map((_, i) => <Skeleton key={i} className="h-10" />)}
        error={() => <p className="text-red-500">There was an error loading the ad spots.</p>}
        empty={() => (
          <p className="text-muted-foreground">No ad spots added for this workspace yet.</p>
        )}
        success={({ data }) => (
          <div className="flex flex-col border rounded-lg divide-y">
            {data.map(spot => (
              <SpotItem key={spot.id} spot={spot} />
            ))}
          </div>
        )}
      />
    </>
  )
}
