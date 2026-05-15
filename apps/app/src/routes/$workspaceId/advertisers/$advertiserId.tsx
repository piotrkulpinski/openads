import {
  formatDate as formatUtilityDate,
  formatDateRange,
  formatNumber,
  getInitials,
} from "@dirstack/utils"
import { Avatar, AvatarFallback } from "@openads/ui/avatar"
import { Badge } from "@openads/ui/badge"
import { Button } from "@openads/ui/button"
import { cx } from "@openads/ui/cva"
import { Skeleton } from "@openads/ui/skeleton"
import { Stack } from "@openads/ui/stack"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ExternalLinkIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { QueryCell } from "~/components/query-cell"
import { Callout, CalloutText } from "~/components/ui/callout"
import { Header, HeaderActions, HeaderTitle } from "~/components/ui/header"
import { H5 } from "~/components/ui/heading"
import { formatTierPrice } from "~/lib/currency"
import { type RouterOutputs, trpc } from "~/lib/trpc"

type Advertiser = RouterOutputs["advertiser"]["getById"]
type AdvertiserAd = Advertiser["ads"][number]

const formatNullableDate = (date: Date | null) => {
  if (!date) return "Not set"
  return formatUtilityDate(date, "medium", "en-US")
}

const formatPeriod = (start: Date | null, end: Date | null) => {
  if (!start && !end) return "No period"
  if (!start || !end) return `${formatNullableDate(start)} - ${formatNullableDate(end)}`
  return formatDateRange(start, end, "medium", "en-US")
}

const adStatusVariant: Record<AdvertiserAd["status"], "secondary" | "success" | "danger"> = {
  Pending: "secondary",
  Approved: "success",
  Rejected: "danger",
}

const subscriptionStatusVariant: Record<
  AdvertiserAd["subscription"]["status"],
  "secondary" | "success" | "warning" | "danger"
> = {
  Trialing: "success",
  Active: "success",
  PastDue: "warning",
  Canceled: "secondary",
  Unpaid: "danger",
  Incomplete: "warning",
  IncompleteExpired: "secondary",
  Paused: "secondary",
}

type AdvertiserMetricProps = ComponentProps<"div"> & {
  label: string
  value: string | number
}

const AdvertiserMetric = ({ label, value, className, ...props }: AdvertiserMetricProps) => {
  return (
    <div className={cx("min-w-0 p-4", className)} {...props}>
      <p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
      <p className="mt-1 truncate font-display text-2xl font-semibold">
        {typeof value === "number" ? formatNumber(value, "standard") : value}
      </p>
    </div>
  )
}

type AdvertiserAdRowProps = ComponentProps<"div"> & {
  workspaceId: string
  ad: AdvertiserAd
}

const AdvertiserAdRow = ({ workspaceId, ad, className, ...props }: AdvertiserAdRowProps) => {
  return (
    <div
      className={cx(
        "relative grid gap-3 px-4 py-4 hover:bg-muted/50 lg:grid-cols-[1fr_13rem_12rem_10rem] lg:items-center",
        className,
      )}
      {...props}
    >
      <Link to="/$workspaceId/ads/$adId" params={{ workspaceId, adId: ad.id }} className="min-w-0">
        <Stack size="sm">
          <H5 className="truncate">{ad.name}</H5>
          <Badge variant={adStatusVariant[ad.status]}>{ad.status}</Badge>
          <Badge variant={subscriptionStatusVariant[ad.subscription.status]}>
            {ad.subscription.status}
          </Badge>
        </Stack>
        <p className="mt-1 truncate text-muted-foreground text-sm">{ad.websiteUrl}</p>
        <span className="absolute inset-0" />
      </Link>

      <div className="min-w-0 text-sm">
        <p className="truncate font-medium">{ad.subscription.tier.name}</p>
        <p className="truncate text-muted-foreground">
          {formatTierPrice(ad.subscription.tierPrice)}
        </p>
      </div>

      <div className="text-sm">
        <p className="text-muted-foreground">Current period</p>
        <p>{formatPeriod(ad.subscription.currentPeriodStart, ad.subscription.currentPeriodEnd)}</p>
      </div>

      <div className="flex gap-4 text-sm lg:justify-end">
        <div>
          <p className="font-medium">{formatNumber(ad.stats.impressions, "standard")}</p>
          <p className="text-muted-foreground">Impressions</p>
        </div>
        <div>
          <p className="font-medium">{formatNumber(ad.stats.clicks, "standard")}</p>
          <p className="text-muted-foreground">Clicks</p>
        </div>
      </div>
    </div>
  )
}

const AdvertiserDetailPage = () => {
  const { workspaceId, advertiserId } = Route.useParams()
  const initial = Route.useLoaderData()

  const advertiserQuery = trpc.advertiser.getById.useQuery(
    { workspaceId, advertiserId },
    { initialData: initial },
  )

  return (
    <QueryCell
      query={advertiserQuery}
      pending={() => <Skeleton className="h-96" />}
      error={() => (
        <Callout variant="danger">
          <CalloutText>Could not load advertiser.</CalloutText>
        </Callout>
      )}
      success={({ data: advertiser }) => (
        <>
          <Header>
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="size-11">
                <AvatarFallback>{getInitials(advertiser.name)}</AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <HeaderTitle>{advertiser.name}</HeaderTitle>
                <p className="truncate text-muted-foreground text-sm">
                  {advertiser.email ?? "No email"} · First seen{" "}
                  {formatUtilityDate(advertiser.createdAt, "medium", "en-US")}
                </p>
              </div>
            </div>

            {advertiser.latestAd && (
              <HeaderActions>
                <Button variant="secondary" prefix={<ExternalLinkIcon />} asChild>
                  <a href={advertiser.latestAd.websiteUrl} target="_blank" rel="noreferrer">
                    Visit site
                  </a>
                </Button>
              </HeaderActions>
            )}
          </Header>

          <div className="grid divide-y rounded-lg border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-5">
            <AdvertiserMetric label="Ads" value={advertiser.totals.ads} />
            <AdvertiserMetric label="Live ads" value={advertiser.totals.activeAds} />
            <AdvertiserMetric
              label="Active subscriptions"
              value={advertiser.totals.activeSubscriptions}
            />
            <AdvertiserMetric label="30d impressions" value={advertiser.totals.impressions} />
            <AdvertiserMetric label="30d clicks" value={advertiser.totals.clicks} />
          </div>

          <div className="mt-6">
            <Stack className="mb-3" size="sm">
              <H5>Ads</H5>
              <Badge variant="secondary">{advertiser.ads.length}</Badge>
            </Stack>

            <div className="flex flex-col divide-y rounded-lg border">
              {advertiser.ads.map(ad => (
                <AdvertiserAdRow key={ad.id} workspaceId={workspaceId} ad={ad} />
              ))}
            </div>
          </div>
        </>
      )}
    />
  )
}

export const Route = createFileRoute("/$workspaceId/advertisers/$advertiserId")({
  loader: async ({ context: { trpc: utils }, params: { workspaceId, advertiserId } }) => {
    return await utils.advertiser.getById.fetch({ workspaceId, advertiserId })
  },

  component: AdvertiserDetailPage,
})
