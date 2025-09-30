import { createFileRoute } from "@tanstack/react-router"
import { CampaignForm } from "~/components/campaigns/campaign-form"
import { H3 } from "~/components/ui/heading"

export const Route = createFileRoute("/$workspaceId/campaigns/new")({
  component: CampaignsNewPage,
})

function CampaignsNewPage() {
  const { workspaceId } = Route.useParams()

  return (
    <>
      <H3>New Campaign</H3>

      <CampaignForm
        workspaceId={workspaceId}
        nextUrl={{ from: Route.fullPath, to: ".." }}
        className="mt-4"
      />
    </>
  )
}
