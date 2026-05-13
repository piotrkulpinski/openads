import { createFileRoute } from "@tanstack/react-router"
import { TierForm } from "~/components/tiers/tier-form"
import { H3 } from "~/components/ui/heading"

export const Route = createFileRoute("/$workspaceId/tiers/new")({
  component: TiersNewPage,
})

function TiersNewPage() {
  const { workspaceId } = Route.useParams()

  return (
    <>
      <H3>New Tier</H3>

      <TierForm
        workspaceId={workspaceId}
        nextUrl={{ from: Route.fullPath, to: ".." }}
        className="mt-4"
      />
    </>
  )
}
