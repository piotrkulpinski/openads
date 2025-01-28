import { Button } from "@openads/ui/button"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { Rows3Icon } from "lucide-react"
import { FieldsModal } from "~/components/modals/fields-modal"
import { SpotForm } from "~/components/spots/spot-form"
import { H3 } from "~/components/ui/heading"
import { Stack } from "~/components/ui/stack"
import { FieldsProvider } from "~/contexts/fields-context"

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
      <Stack className="justify-between">
        <H3>Edit Ad Spot</H3>

        <FieldsProvider spot={spot}>
          <FieldsModal>
            <Button prefix={<Rows3Icon />} className="-my-1">
              Edit Custom Fields
            </Button>
          </FieldsModal>
        </FieldsProvider>
      </Stack>

      <SpotForm
        workspaceId={workspace.id}
        spot={spot}
        nextUrl={{ from: Route.fullPath, to: ".." }}
        className="mt-4"
      />
    </>
  )
}
