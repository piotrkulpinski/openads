import { Button } from "@openads/ui/button"
import { Skeleton } from "@openads/ui/skeleton"
import { Stack } from "@openads/ui/stack"
import { createFileRoute, Link } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"
import { CampaignItem } from "~/components/campaigns/campaign-item"
import { QueryCell } from "~/components/query-cell"
import { H3 } from "~/components/ui/heading"
import { trpc } from "~/lib/trpc"

export const Route = createFileRoute("/$workspace/campaigns/")({
  component: CampaignsIndexPage,
})

function CampaignsIndexPage() {
  const { workspace } = Route.useRouteContext()
  const campaignsQuery = trpc.campaign.getAll.useQuery({ workspaceId: workspace.id })

  return (
    <>
      <Stack className="justify-between">
        <H3>Campaigns</H3>

        <Button prefix={<PlusIcon />} className="-my-1" asChild>
          <Link to="/$workspace/campaigns/new" params={{ workspace: workspace.slug }}>
            Create Campaign
          </Link>
        </Button>
      </Stack>

      <QueryCell
        query={campaignsQuery}
        pending={() => [...Array(3)].map((_, i) => <Skeleton key={i} className="h-10" />)}
        error={() => <p className="text-red-500">There was an error loading the campaigns.</p>}
        empty={() => (
          <p className="text-muted-foreground">No campaigns scheduled for this workspace yet.</p>
        )}
        success={({ data }) => (
          <div className="flex flex-col border rounded-lg divide-y">
            {data.map(campaign => (
              <CampaignItem key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      />
    </>
  )
}
