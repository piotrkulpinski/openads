import { AdStatus } from "@openads/db/client"
import { Skeleton } from "@openads/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@openads/ui/tabs"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { MegaphoneIcon } from "lucide-react"
import { z } from "zod"
import { AdRow } from "~/components/ads/ad-row"
import { QueryCell } from "~/components/query-cell"
import { Callout, CalloutText } from "~/components/ui/callout"
import { Header, HeaderTitle } from "~/components/ui/header"
import { orpc } from "~/lib/orpc"

export const Route = createFileRoute("/$workspaceId/ads/")({
  validateSearch: z.object({
    status: z.enum(AdStatus).optional(),
  }),

  component: AdsIndexPage,
})

function AdsIndexPage() {
  const { workspaceId } = Route.useParams()
  const { status } = Route.useSearch()
  const navigate = Route.useNavigate()

  const adsQuery = useQuery(orpc.ad.getAll.queryOptions({ input: { workspaceId, status } }))

  return (
    <>
      <Header>
        <HeaderTitle>Ads</HeaderTitle>
      </Header>

      <Tabs
        value={status ?? "all"}
        onValueChange={value =>
          navigate({
            search: {
              status: value === "all" ? undefined : (value as AdStatus),
            },
          })
        }
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="Pending">Pending</TabsTrigger>
          <TabsTrigger value="Approved">Approved</TabsTrigger>
          <TabsTrigger value="Rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      <QueryCell
        query={adsQuery}
        pending={() => [...Array(3)].map((_, i) => <Skeleton key={i} className="h-14" />)}
        error={() => (
          <Callout variant="danger">
            <CalloutText>Could not load ads.</CalloutText>
          </Callout>
        )}
        empty={() => (
          <Callout variant="info" prefix={<MegaphoneIcon />}>
            <CalloutText>No ads in this view yet.</CalloutText>
          </Callout>
        )}
        success={({ data }) => (
          <div className="flex flex-col divide-y rounded-lg border">
            {data.map(ad => (
              <AdRow key={ad.id} workspaceId={workspaceId} ad={ad} />
            ))}
          </div>
        )}
      />
    </>
  )
}
