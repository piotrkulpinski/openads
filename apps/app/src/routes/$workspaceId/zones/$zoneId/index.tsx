import { Button } from "@openads/ui/button"
import { Stack } from "@openads/ui/stack"
import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { PackageIcon, Rows3Icon } from "lucide-react"
import { FieldsModal } from "~/components/modals/fields-modal"
import { H3 } from "~/components/ui/heading"
import { ZoneForm } from "~/components/zones/zone-form"
import { FieldsProvider } from "~/contexts/fields-context"

export const Route = createFileRoute("/$workspaceId/zones/$zoneId/")({
  loader: async ({ context: { trpc }, params: { workspaceId, zoneId } }) => {
    const zone = await trpc.zone.getById.fetch({
      id: zoneId,
      workspaceId,
    })

    if (!zone) {
      throw notFound()
    }

    return { zone }
  },

  component: ZonesEditPage,
})

function ZonesEditPage() {
  const { workspaceId } = Route.useParams()
  const { zone } = Route.useLoaderData()

  return (
    <>
      <Stack className="justify-between">
        <H3>Edit Ad Zone</H3>

        <Stack size="sm">
          <Button prefix={<PackageIcon />} variant="secondary" className="-my-1" asChild>
            <Link
              to="/$workspaceId/zones/$zoneId/packages"
              params={{ workspaceId, zoneId: zone.id }}
            >
              Manage Packages
            </Link>
          </Button>

          <FieldsProvider zone={zone}>
            <FieldsModal>
              <Button prefix={<Rows3Icon />} className="-my-1">
                Edit Custom Fields
              </Button>
            </FieldsModal>
          </FieldsProvider>
        </Stack>
      </Stack>

      <ZoneForm
        workspaceId={workspaceId}
        zone={zone}
        nextUrl={{ from: Route.fullPath, to: ".." }}
        className="mt-4"
      />
    </>
  )
}
