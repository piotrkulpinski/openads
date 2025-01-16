import { createFileRoute, notFound } from "@tanstack/react-router"
import { H3 } from "~/components/heading"
import { SpotForm } from "~/components/spots/spot-form"
import { trpc } from "~/lib/trpc"

export const Route = createFileRoute("/$workspace/spots/$spotId")({
  loader: async ({ context: { trpcUtils, workspace }, params: { spotId } }) => {
    const spot = await trpcUtils.spot.getById.ensureData({ id: spotId, workspaceId: workspace.id })

    if (!spot) {
      throw notFound()
    }

    return
  },

  component: SpotsEditPage,
})

function SpotsEditPage() {
  const { workspace } = Route.useRouteContext()
  const { spotId } = Route.useParams()

  const { data: spot } = trpc.spot.getById.useQuery(
    { id: spotId, workspaceId: workspace.id },
    { enabled: !!spotId },
  )

  if (!spot) {
    throw notFound()
  }

  return (
    <>
      <H3>Edit Ad Spot</H3>
      <SpotForm
        workspaceId={workspace.id}
        spot={spot}
        nextUrl={{ from: Route.fullPath, to: ".." }}
        className="mt-4"
      />
    </>
  )
}
