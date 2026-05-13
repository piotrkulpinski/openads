import { Button } from "@openads/ui/button"
import { Skeleton } from "@openads/ui/skeleton"
import { createFileRoute, Link } from "@tanstack/react-router"
import { LayersIcon, PlusIcon } from "lucide-react"
import { QueryCell } from "~/components/query-cell"
import { TierItem } from "~/components/tiers/tier-item"
import { Callout, CalloutText } from "~/components/ui/callout"
import { Header, HeaderActions, HeaderTitle } from "~/components/ui/header"
import { trpc } from "~/lib/trpc"

export const Route = createFileRoute("/$workspaceId/tiers/")({
  component: TiersIndexPage,
})

function TiersIndexPage() {
  const { workspaceId } = Route.useParams()
  const tiersQuery = trpc.tier.getAll.useQuery({ workspaceId })

  return (
    <>
      <Header>
        <HeaderTitle>Tiers</HeaderTitle>

        <HeaderActions>
          <Button prefix={<PlusIcon />} asChild>
            <Link to="/$workspaceId/tiers/new" params={{ workspaceId }}>
              Create Tier
            </Link>
          </Button>
        </HeaderActions>
      </Header>

      <QueryCell
        query={tiersQuery}
        pending={() => [...Array(3)].map((_, i) => <Skeleton key={i} className="h-10" />)}
        error={() => (
          <Callout variant="danger">
            <CalloutText>We could not load tiers for this workspace.</CalloutText>
          </Callout>
        )}
        empty={() => (
          <Callout variant="info" prefix={<LayersIcon />}>
            <CalloutText>
              No tiers defined yet.{" "}
              <Link to="/$workspaceId/tiers/new" params={{ workspaceId }}>
                Create your first tier here
              </Link>
              .
            </CalloutText>
          </Callout>
        )}
        success={({ data }) => (
          <div className="flex flex-col divide-y rounded-lg border">
            {data.map(tier => (
              <TierItem key={tier.id} workspaceId={workspaceId} tier={tier} />
            ))}
          </div>
        )}
      />
    </>
  )
}
