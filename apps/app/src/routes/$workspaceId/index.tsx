import { formatDate, formatNumber, getInitials } from "@dirstack/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@openads/ui/avatar"
import { Badge } from "@openads/ui/badge"
import { Button } from "@openads/ui/button"
import { cx } from "@openads/ui/cva"
import { Skeleton } from "@openads/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { CheckIcon, CodeXmlIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import { z } from "zod"
import { getServingState, ServingDot } from "~/components/ads/serving-state"
import { WelcomeModal } from "~/components/modals/welcome-modal"
import { QueryCell } from "~/components/query-cell"
import { PerformanceChart } from "~/components/stats/performance-chart"
import { Callout, CalloutText } from "~/components/ui/callout"
import { Card } from "~/components/ui/card"
import { Header, HeaderActions, HeaderTitle } from "~/components/ui/header"
import { H5 } from "~/components/ui/heading"
import { useWorkspace } from "~/contexts/workspace-context"
import { formatPrice } from "~/lib/currency"
import { orpc, type RouterOutputs } from "~/lib/orpc"

export const Route = createFileRoute("/$workspaceId/")({
  validateSearch: z.object({
    onboarded: z.boolean().optional(),
  }),

  loader: async ({ context: { orpc, queryClient }, params: { workspaceId } }) => {
    await queryClient.prefetchQuery(orpc.dashboard.get.queryOptions({ input: { workspaceId } }))
  },

  component: DashboardPage,
})

type Dashboard = RouterOutputs["dashboard"]["get"]
type DashboardAd = Dashboard["recentAds"][number]

const adStatusVariant: Record<DashboardAd["status"], "secondary" | "success" | "danger"> = {
  Pending: "secondary",
  Approved: "success",
  Rejected: "danger",
}

function DashboardPage() {
  const workspace = useWorkspace()
  const navigate = useNavigate({ from: Route.fullPath })
  const { onboarded } = Route.useSearch()
  const { workspaceId } = Route.useParams()

  const dashboardQuery = useQuery(orpc.dashboard.get.queryOptions({ input: { workspaceId } }))

  return (
    <>
      <WelcomeModal
        open={!!onboarded}
        onOpenChange={open => {
          if (!open) navigate({ search: {}, replace: true })
        }}
      />

      <Header>
        <div className="min-w-0">
          <HeaderTitle>Dashboard</HeaderTitle>
          <p className="truncate text-muted-foreground text-sm">
            What's happening across {workspace.name}
          </p>
        </div>

        <HeaderActions>
          <Button variant="secondary" prefix={<CodeXmlIcon />} asChild>
            <Link to="/$workspaceId/embed" params={{ workspaceId }}>
              Embed widget
            </Link>
          </Button>
        </HeaderActions>
      </Header>

      <QueryCell
        query={dashboardQuery}
        pending={() => (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-80" />
          </>
        )}
        error={() => (
          <Callout variant="danger">
            <CalloutText>Could not load the dashboard.</CalloutText>
          </Callout>
        )}
        success={({ data }) => <DashboardBody workspaceId={workspaceId} data={data} />}
      />
    </>
  )
}

const DashboardBody = ({ workspaceId, data }: { workspaceId: string; data: Dashboard }) => {
  const { revenue, counts, totals, series, pendingAds, recentAds } = data
  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : null

  return (
    <>
      <div className="grid animate-slide-up-and-fade grid-cols-2 divide-y rounded-lg border [animation-fill-mode:backwards] sm:grid-cols-3 sm:divide-y-0 sm:divide-x lg:grid-cols-5">
        <Metric
          label="Monthly revenue"
          value={
            revenue.paidSubscriptions > 0
              ? formatPrice(revenue.monthlyCents, revenue.currency)
              : "—"
          }
          hint={
            revenue.paidSubscriptions > 0
              ? `across ${revenue.paidSubscriptions} paid`
              : "no paid subscriptions"
          }
        />
        <Metric label="Serving ads" value={counts.servingAds} hint={`of ${counts.ads} total`} />
        <Metric
          label="Pending review"
          value={pendingAds.length}
          hint={pendingAds.length > 0 ? "needs your decision" : "all caught up"}
        />
        <Metric label="30d impressions" value={totals.impressions} />
        <Metric label="30d CTR" value={ctr === null ? "—" : `${ctr.toFixed(2)}%`} />
      </div>

      <Card className="animate-slide-up-and-fade [animation-delay:75ms] [animation-fill-mode:backwards]">
        <Card.Section className="gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <H5>Performance</H5>
            <p className="text-muted-foreground text-xs">
              {formatNumber(totals.clicks, "standard")} clicks · Last 30 days
            </p>
          </div>

          {series.length > 0 ? (
            <PerformanceChart rows={series} />
          ) : (
            <div className="bg-dashed flex h-32 items-center justify-center rounded-lg border">
              <p className="rounded-md bg-background px-3 py-1.5 text-muted-foreground text-sm">
                No traffic recorded yet — stats appear once ads start serving.
              </p>
            </div>
          )}
        </Card.Section>
      </Card>

      <div className="grid animate-slide-up-and-fade items-start gap-6 [animation-delay:150ms] [animation-fill-mode:backwards] lg:grid-cols-2">
        <ListCard
          title="Review queue"
          count={pendingAds.length}
          action={
            pendingAds.length > 0 && (
              <Link
                to="/$workspaceId/ads"
                params={{ workspaceId }}
                search={{ status: "Pending" }}
                className="text-muted-foreground text-sm hover:text-foreground"
              >
                View all
              </Link>
            )
          }
        >
          {pendingAds.length === 0 ? (
            <EmptyNote icon={<CheckIcon className="text-green-600 dark:text-green-400" />}>
              All clear — nothing waiting for review.
            </EmptyNote>
          ) : (
            <div className="flex flex-col divide-y">
              {pendingAds.slice(0, 5).map(ad => (
                <DashboardAdRow key={ad.id} workspaceId={workspaceId} ad={ad}>
                  Submitted {formatDate(ad.createdAt, "medium", "en-US")} ·{" "}
                  {ad.advertiser.email ?? ad.advertiser.name}
                </DashboardAdRow>
              ))}
            </div>
          )}
        </ListCard>

        <ListCard
          title="Latest ads"
          count={counts.ads}
          action={
            counts.ads > 0 && (
              <Link
                to="/$workspaceId/ads"
                params={{ workspaceId }}
                className="text-muted-foreground text-sm hover:text-foreground"
              >
                View all
              </Link>
            )
          }
        >
          {recentAds.length === 0 ? (
            <EmptyNote icon={<CodeXmlIcon />}>
              No ads yet — drop the{" "}
              <Link
                to="/$workspaceId/embed"
                params={{ workspaceId }}
                className="font-medium underline decoration-border underline-offset-4 hover:decoration-foreground"
              >
                tier selector
              </Link>{" "}
              on your site to get your first advertiser.
            </EmptyNote>
          ) : (
            <div className="flex flex-col divide-y">
              {recentAds.map(ad => (
                <DashboardAdRow key={ad.id} workspaceId={workspaceId} ad={ad} showStatus>
                  {ad.tier.name} · {ad.advertiser.email ?? ad.advertiser.name}
                </DashboardAdRow>
              ))}
            </div>
          )}
        </ListCard>
      </div>
    </>
  )
}

type MetricProps = ComponentProps<"div"> & {
  label: string
  value: string | number
  hint?: string
}

const Metric = ({ label, value, hint, className, ...props }: MetricProps) => {
  return (
    <div className={cx("min-w-0 p-4", className)} {...props}>
      <p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
      <p className="mt-1 truncate font-display text-2xl font-semibold tabular-nums">
        {typeof value === "number" ? formatNumber(value, "standard") : value}
      </p>
      {hint && <p className="truncate text-muted-foreground text-xs">{hint}</p>}
    </div>
  )
}

type ListCardProps = {
  title: string
  count: number
  action?: ReactNode
  children: ReactNode
}

const ListCard = ({ title, count, action, children }: ListCardProps) => {
  return (
    <Card>
      <Card.Panel className="flex items-center gap-2 px-4 py-3">
        <H5>{title}</H5>
        <Badge variant="secondary">{count}</Badge>
        <div className="ml-auto">{action}</div>
      </Card.Panel>

      <Card.Panel>{children}</Card.Panel>
    </Card>
  )
}

const EmptyNote = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => {
  return (
    <div className="flex items-center gap-2.5 px-4 py-6 text-muted-foreground text-sm">
      <span className="shrink-0 [&_svg]:size-4.5">{icon}</span>
      <p>{children}</p>
    </div>
  )
}

type DashboardAdRowProps = {
  workspaceId: string
  ad: DashboardAd
  showStatus?: boolean
  children: ReactNode
}

const DashboardAdRow = ({ workspaceId, ad, showStatus, children }: DashboardAdRowProps) => {
  const serving = getServingState(ad)

  return (
    <div className="relative flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
      <span className="relative shrink-0">
        <Avatar className="size-9 rounded-md border">
          <AvatarImage src={ad.faviconUrl || undefined} className="p-1" />
          <AvatarFallback className="rounded-none text-xs">
            {getInitials(ad.name, 3)}
          </AvatarFallback>
        </Avatar>

        <span
          className="-right-0.5 -bottom-0.5 absolute rounded-full bg-background p-0.5"
          title={serving.detail}
        >
          <ServingDot state={serving} />
        </span>
      </span>

      <Link
        to="/$workspaceId/ads/$adId"
        params={{ workspaceId, adId: ad.id }}
        className="min-w-0 flex-1"
      >
        <span className="flex items-center gap-2">
          <H5 className="truncate">{ad.name}</H5>
          {showStatus && <Badge variant={adStatusVariant[ad.status]}>{ad.status}</Badge>}
        </span>
        <span className="block truncate text-muted-foreground text-sm">{children}</span>
        <span className="absolute inset-0" />
      </Link>
    </div>
  )
}
