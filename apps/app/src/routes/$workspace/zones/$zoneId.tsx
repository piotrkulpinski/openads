import { Button } from "@openads/ui/button"
import { Stack } from "@openads/ui/stack"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { Rows3Icon } from "lucide-react"
import { FieldsModal } from "~/components/modals/fields-modal"
import { H3 } from "~/components/ui/heading"
import { ZoneForm } from "~/components/zones/zone-form"
import { FieldsProvider } from "~/contexts/fields-context"

export const Route = createFileRoute("/$workspace/zones/$zoneId")({
  loader: async ({ context: { trpcUtils, workspace }, params: { zoneId } }) => {
    const zone = await trpcUtils.zone.getById.fetch({
      id: zoneId,
      workspaceId: workspace.id,
    })

    if (!zone) {
      throw notFound()
    }

    return { zone }
  },

  component: ZonesEditPage,
})

function ZonesEditPage() {
  const { workspace } = Route.useRouteContext()
  const { zone } = Route.useLoaderData()

  return (
    <>
      <Stack className="justify-between">
        <H3>Edit Ad Zone</H3>

        <FieldsProvider zone={zone}>
          <FieldsModal>
            <Button prefix={<Rows3Icon />} className="-my-1">
              Edit Custom Fields
            </Button>
          </FieldsModal>
        </FieldsProvider>
      </Stack>

      <ZoneForm
        workspaceId={workspace.id}
        zone={zone}
        nextUrl={{ from: Route.fullPath, to: ".." }}
        className="mt-4"
      />
    </>
  )
}
