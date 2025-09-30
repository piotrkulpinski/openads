import { Button } from "@openads/ui/button"
import { Skeleton } from "@openads/ui/skeleton"
import { createFileRoute, Link } from "@tanstack/react-router"
import { InfoIcon, MegaphoneIcon, PlusIcon } from "lucide-react"
import { CampaignItem } from "~/components/campaigns/campaign-item"
import { QueryCell } from "~/components/query-cell"
import { Callout, CalloutText } from "~/components/ui/callout"
import { Header, HeaderActions, HeaderTitle } from "~/components/ui/header"
import { trpc } from "~/lib/trpc"

export const Route = createFileRoute("/$workspace/campaigns/")({
  loader: async ({ context: { trpcUtils, workspace } }) => {
    const zones = await trpcUtils.zone.getAll.fetch({
      workspaceId: workspace.id,
    })

    return { zones }
  },

  component: CampaignsIndexPage,
})

function CampaignsIndexPage() {
  const { workspace } = Route.useRouteContext()
  const { zones } = Route.useLoaderData()

  const campaignsQuery = trpc.campaign.getAll.useQuery({ workspaceId: workspace.id })

  return (
    <>
      <Header>
        <HeaderTitle>Campaigns</HeaderTitle>

        <HeaderActions>
          <Button prefix={<PlusIcon />} disabled={!zones.length} asChild>
            <Link to="/$workspace/campaigns/new" params={{ workspace: workspace.slug }}>
              Create Campaign
            </Link>
          </Button>
        </HeaderActions>
      </Header>

      {zones.length ? (
        <QueryCell
          query={campaignsQuery}
          pending={() => [...Array(3)].map((_, i) => <Skeleton key={i} className="h-10" />)}
          error={() => (
            <Callout variant="danger">
              <CalloutText>
                We could not load campaigns for this workspace. Please try again later.
              </CalloutText>
            </Callout>
          )}
          empty={() => (
            <Callout variant="info" prefix={<MegaphoneIcon />}>
              <CalloutText>
                No campaigns scheduled for this workspace yet. They will appear here once an ad is
                purchased and scheduled. You can also{" "}
                <Link to="/$workspace/campaigns/new" params={{ workspace: workspace.slug }}>
                  add a campaign manually
                </Link>
                .
              </CalloutText>
            </Callout>
          )}
          success={({ data }) => (
            <div className="flex flex-col border rounded-lg divide-y">
              {data.map(campaign => (
                <CampaignItem key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        />
      ) : (
        <Callout variant="warning" prefix={<InfoIcon />}>
          <CalloutText>
            Create an ad zone before scheduling campaigns. You can{" "}
            <Link to="/$workspace/zones/new" params={{ workspace: workspace.slug }}>
              create your first zone
            </Link>
            .
          </CalloutText>
        </Callout>
      )}
    </>
  )
}
