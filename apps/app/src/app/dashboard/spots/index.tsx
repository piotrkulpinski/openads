import { Skeleton } from "@openads/ui/skeleton"
import { H3 } from "~/components/heading"
import { QueryCell } from "~/components/query-cell"
import { SpotItem } from "~/components/spots/spot-item"
import { useWorkspace } from "~/contexts/workspace-context"
import { trpc } from "~/lib/trpc"

export default function SpotsIndexPage() {
  const { id: workspaceId } = useWorkspace()
  const spotsQuery = trpc.spot.getAll.useQuery({ workspaceId }, { initialData: [] })

  return (
    <>
      <H3>Ad Spots</H3>

      <div className="grid grid-cols-2 gap-4">
        <QueryCell
          query={spotsQuery}
          pending={() => Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} />)}
          error={() => <p className="text-red-500">There was an error loading the ad spots.</p>}
          empty={() => <p className="text-secondary">No ad spots added for this workspace yet.</p>}
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
