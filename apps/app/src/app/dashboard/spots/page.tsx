import { use } from "react"
import { H3, H4 } from "~/components/heading"
import { WorkspaceContext } from "~/contexts/workspace-context"
import { trpc } from "~/lib/trpc"

export default function SpotsPage() {
  const { id: workspaceId } = use(WorkspaceContext)
  const { data: spots } = trpc.spot.getAll.useQuery({ workspaceId }, { initialData: [] })

  return (
    <>
      <H3>Ad Spots</H3>

      <div className="grid grid-cols-2 gap-4">
        {spots.map(spot => (
          <div key={spot.id}>
            <H4>{spot.name}</H4>
          </div>
        ))}
      </div>
    </>
  )
}
