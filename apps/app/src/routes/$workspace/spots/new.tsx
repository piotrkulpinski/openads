import { createFileRoute } from "@tanstack/react-router"
import { H3 } from "~/components/heading"
import { SpotForm } from "~/components/spots/spot-form"

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
