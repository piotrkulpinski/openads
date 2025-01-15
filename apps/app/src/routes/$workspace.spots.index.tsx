import { Skeleton } from "@openads/ui/skeleton"
import { createFileRoute } from "@tanstack/react-router"
import { H3 } from "~/components/heading"
import { QueryCell } from "~/components/query-cell"
import { SpotItem } from "~/components/spots/spot-item"
import { trpc } from "~/lib/trpc"

export const Route = createFileRoute("/$workspace/spots/")({
  // loader: async ({ context: { trpcUtils, workspace } }) => {
  //   await trpcUtils.spot.getAll.ensureData({ workspaceId: workspace.id })
  // },

  component: SpotsIndexPage,
})

export default function SpotsIndexPage() {
  const { workspace } = Route.useRouteContext()
  const spotsQuery = trpc.spot.getAll.useQuery({ workspaceId: workspace.id })

  return (
    <>
      <H3>Ad Spots</H3>

      <div className="grid grid-cols-2 gap-4">
        <QueryCell
          query={spotsQuery}
          pending={() => [...Array(3)].map((_, i) => <Skeleton key={i} className="h-10" />)}
          error={() => <p className="text-red-500">There was an error loading the ad spots.</p>}
          empty={() => (
            <p className="text-muted-foreground">No ad spots added for this workspace yet.</p>
          )}
          success={({ data }) => (
            <>
              {data.map(spot => (
                <SpotItem key={spot.id} spot={spot} />
              ))}
            </>
          )}
        />
      </div>
    </>
  )
}
