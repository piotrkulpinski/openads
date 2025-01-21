import { createFileRoute, notFound } from "@tanstack/react-router"
import { SpotForm } from "~/components/spots/spot-form"
import { H3 } from "~/components/ui/heading"

export const Route = createFileRoute("/$workspace/spots/$spotId")({
  loader: async ({ context: { trpcUtils, workspace }, params: { spotId } }) => {
    const spot = await trpcUtils.spot.getById.fetch({
      id: spotId,
      workspaceId: workspace.id,
    })

    if (!spot) {
      throw notFound()
    }

    return { spot }
  },

  component: SpotsEditPage,
})

function SpotsEditPage() {
  const { workspace } = Route.useRouteContext()
  const { spot } = Route.useLoaderData()

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
