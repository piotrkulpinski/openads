import { formatDate, formatNumber, getInitials, isValidUrl } from "@dirstack/utils"
import { isServingSubscription } from "@openads/db/lib/subscription"
import { Avatar, AvatarFallback, AvatarImage } from "@openads/ui/avatar"
import { Badge } from "@openads/ui/badge"
import { Button } from "@openads/ui/button"
import { cx } from "@openads/ui/cva"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowUpRightIcon, MailIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { AdAvatar } from "~/components/ads/ad-avatar"
import { getServingState } from "~/components/ads/serving-state"
import { AdStatusBadge, SubscriptionStatusBadge } from "~/components/ads/status-badge"
import { QueryCell } from "~/components/query-cell"
import { formatCtr, Metric } from "~/components/stats/metric"
import { Callout, CalloutText } from "~/components/ui/callout"
import { Header, HeaderActions, HeaderTitle } from "~/components/ui/header"
import { H5 } from "~/components/ui/heading"
import { formatPrice, formatTierPrice } from "~/lib/currency"
import { orpc, type RouterOutputs } from "~/lib/orpc"

export const Route = createFileRoute("/$workspaceId/advertisers/$advertiserId")({
  loader: async ({ context: { orpc, queryClient }, params: { workspaceId, advertiserId } }) => {
    return await queryClient.fetchQuery(
      orpc.advertiser.getById.queryOptions({ input: { workspaceId, advertiserId } }),
    )
  },

  component: AdvertiserDetailPage,
})

type Advertiser = RouterOutputs["advertiser"]["getById"]
type AdvertiserAd = Advertiser["ads"][number]

function AdvertiserDetailPage() {
  const { workspaceId, advertiserId } = Route.useParams()
  const initial = Route.useLoaderData()

  const advertiserQuery = useQuery(
    orpc.advertiser.getById.queryOptions({
      input: { workspaceId, advertiserId },
      initialData: initial,
    }),
  )

  return (
    <QueryCell
      query={advertiserQuery}
      error={() => (
        <Callout variant="danger">
          <CalloutText>Could not load advertiser.</CalloutText>
        </Callout>
      )}
      success={({ data: advertiser }) => {
        const { totals } = advertiser
        const monthlyRevenue =
          totals.activeSubscriptions > 0 ? formatPrice(totals.monthlyCents, totals.currency) : null

        return (
          <>
            <Header>
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="size-11 rounded-md border">
                  {advertiser.latestAd && (
                    <AvatarImage
                      src={advertiser.latestAd.faviconUrl || undefined}
                      className="p-1.5"
                    />
                  )}
                  <AvatarFallback className="rounded-none">
                    {getInitials(advertiser.name, 3)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <HeaderTitle className="truncate">{advertiser.name}</HeaderTitle>
                  <p className="truncate text-muted-foreground text-sm">
                    {advertiser.email ?? "No email"} · Customer since{" "}
                    {formatDate(advertiser.createdAt, "medium", "en-US")}
                  </p>
                </div>
              </div>

              <HeaderActions>
                {advertiser.email && (
                  <Button variant="secondary" prefix={<MailIcon />} asChild>
                    <a href={`mailto:${advertiser.email}`}>Email</a>
                  </Button>
                )}

                {advertiser.latestAd && isValidUrl(advertiser.latestAd.websiteUrl) && (
                  <Button variant="secondary" suffix={<ArrowUpRightIcon />} asChild>
                    <a href={advertiser.latestAd.websiteUrl} target="_blank" rel="noreferrer">
                      Visit site
                    </a>
                  </Button>
                )}
              </HeaderActions>
            </Header>

            <div className="grid animate-slide-up-and-fade grid-cols-2 divide-y rounded-lg border [animation-fill-mode:backwards] sm:grid-cols-4 sm:divide-y-0 sm:divide-x lg:grid-cols-5">
              <Metric
                label="Monthly revenue"
                value={monthlyRevenue ?? "—"}
                hint={
                  monthlyRevenue
                    ? `across ${totals.activeSubscriptions} paid`
                    : "no paid subscriptions"
                }
              />
              <Metric
                label="Live ads"
                value={totals.activeAds}
                hint={`of ${totals.ads} submitted`}
              />
              <Metric label="30d impressions" value={totals.impressions} />
              <Metric label="30d clicks" value={totals.clicks} />
              <Metric
                label="30d CTR"
                value={formatCtr(totals)}
                className="col-span-2 border-t sm:col-span-1 sm:border-t-0"
              />
            </div>

            <div className="mt-2 flex animate-slide-up-and-fade flex-col gap-3 [animation-delay:75ms] [animation-fill-mode:backwards]">
              <div className="flex items-center gap-2">
                <H5>Ads</H5>
                <Badge variant="secondary">{advertiser.ads.length}</Badge>
              </div>

              <div className="flex flex-col divide-y rounded-lg border">
                {advertiser.ads.map(ad => (
                  <AdvertiserAdRow key={ad.id} workspaceId={workspaceId} ad={ad} />
                ))}
              </div>
            </div>
          </>
        )
      }}
    />
  )
}

type AdvertiserAdRowProps = ComponentProps<"div"> & {
  workspaceId: string
  ad: AdvertiserAd
}

const AdvertiserAdRow = ({ workspaceId, ad, className, ...props }: AdvertiserAdRowProps) => {
  const { subscription } = ad
  const serving = getServingState(ad)
  const paid = isServingSubscription(subscription.status)

  return (
    <div
      className={cx(
        "relative grid gap-x-4 gap-y-2 px-4 py-3.5 hover:bg-muted/50 lg:grid-cols-[minmax(0,1fr)_11rem_10rem_11rem] lg:items-center",
        className,
      )}
      {...props}
    >
      <Link
        to="/$workspaceId/ads/$adId"
        params={{ workspaceId, adId: ad.id }}
        className="flex min-w-0 items-center gap-3"
      >
        <AdAvatar ad={ad} serving={serving} />

        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <H5 className="truncate">{ad.name}</H5>
            <AdStatusBadge status={ad.status} />
          </span>
          <span className="block truncate text-muted-foreground text-sm">{ad.websiteUrl}</span>
        </span>

        <span className="absolute inset-0" />
      </Link>

      <div className="min-w-0 text-sm">
        <p className="truncate font-medium">{subscription.tier.name}</p>
        <p className="truncate text-muted-foreground tabular-nums">
          {formatTierPrice(subscription.tierPrice)}
        </p>
      </div>

      <div className="min-w-0 text-sm">
        <p>
          <SubscriptionStatusBadge status={subscription.status} />
        </p>
        {subscription.currentPeriodEnd && paid && (
          <p className="mt-1 truncate text-muted-foreground tabular-nums">
            {subscription.cancelAtPeriodEnd ? "Ends" : "Renews"}{" "}
            {formatDate(subscription.currentPeriodEnd, "medium", "en-US")}
          </p>
        )}
      </div>

      <div className="flex gap-5 text-sm lg:justify-end lg:text-right">
        <div>
          <p className="font-medium tabular-nums">
            {formatNumber(ad.stats.impressions, "standard")}
          </p>
          <p className="text-muted-foreground">Impressions</p>
        </div>
        <div>
          <p className="font-medium tabular-nums">{formatNumber(ad.stats.clicks, "standard")}</p>
          <p className="text-muted-foreground">Clicks</p>
        </div>
      </div>
    </div>
  )
}
