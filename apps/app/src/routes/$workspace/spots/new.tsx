import { createFileRoute } from "@tanstack/react-router"
import { SpotForm } from "~/components/spots/spot-form"
import { H3 } from "~/components/ui/heading"

export const Route = createFileRoute("/$workspace/spots/new")({
  component: SpotsNewPage,
})

function SpotsNewPage() {
  const { workspace } = Route.useRouteContext()

  return (
    <>
      <H3>New Ad Spot</H3>
      <SpotForm
        workspaceId={workspace.id}
        nextUrl={{ from: Route.fullPath, to: ".." }}
        className="mt-4"
      />
    </>
  )
}
