import { useParams } from "react-router"
import { H3 } from "~/components/heading"
import { CreateSpotForm } from "~/components/spots/create-spot-form"
import { useWorkspace } from "~/contexts/workspace-context"
import { trpc } from "~/lib/trpc"

export default function SpotsEditPage() {
  const { id: workspaceId } = useWorkspace()
  const { id } = useParams() as { id: string }
  const { data: spot } = trpc.spot.getById.useQuery({ id, workspaceId }, { enabled: !!id })

  return (
    <>
      <H3>Edit Ad Spot</H3>
      <CreateSpotForm className="mt-4" />
    </>
  )
}
