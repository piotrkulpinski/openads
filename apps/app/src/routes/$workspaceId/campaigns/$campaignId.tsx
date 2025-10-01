import { createFileRoute, notFound } from "@tanstack/react-router"
import { CampaignForm } from "~/components/campaigns/campaign-form"
import { H3 } from "~/components/ui/heading"

export const Route = createFileRoute("/$workspaceId/campaigns/$campaignId")({
  loader: async ({ context: { trpc, workspace }, params: { campaignId } }) => {
    const campaign = await trpc.campaign.getById.fetch({
      id: campaignId,
      workspaceId: workspace.id,
    })

    if (!campaign) {
      throw notFound()
    }

    return { campaign }
  },

  component: CampaignEditPage,
})

function CampaignEditPage() {
  const { workspaceId } = Route.useParams()
  const { campaign } = Route.useLoaderData()

  return (
    <>
      <H3>Edit Campaign</H3>

      <CampaignForm
        workspaceId={workspaceId}
        campaign={campaign}
        nextUrl={{ from: Route.fullPath, to: ".." }}
        className="mt-4"
      />
    </>
  )
}
