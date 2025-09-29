import { createFileRoute } from "@tanstack/react-router"
import { H3 } from "~/components/ui/heading"
import { ZoneForm } from "~/components/zones/zone-form"

export const Route = createFileRoute("/$workspace/zones/new")({
  component: ZonesNewPage,
})

function ZonesNewPage() {
  const { workspace } = Route.useRouteContext()

  return (
    <>
      <H3>New Ad Zone</H3>

      <ZoneForm
        workspaceId={workspace.id}
        nextUrl={{ from: Route.fullPath, to: ".." }}
        className="mt-4"
      />
    </>
  )
}
