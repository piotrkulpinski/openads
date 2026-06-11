import { formatNumber } from "@dirstack/utils"
import { cx } from "@openads/ui/cva"
import { Skeleton } from "@openads/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import type { ComponentProps } from "react"
import { QueryCell } from "~/components/query-cell"
import { PerformanceChart } from "~/components/stats/performance-chart"
import { Card } from "~/components/ui/card"
import { H5 } from "~/components/ui/heading"
import { orpc, type RouterOutputs } from "~/lib/orpc"

type Stats = RouterOutputs["ad"]["getStats"]

type AdStatsProps = ComponentProps<typeof Card> & {
  workspaceId: string
  adId: string
}

export const AdStats = ({ workspaceId, adId, ...props }: AdStatsProps) => {
  const statsQuery = useQuery(
    orpc.ad.getStats.queryOptions({ input: { workspaceId, adId, days: 30 } }),
  )

  return (
    <Card {...props}>
      <Card.Section className="gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <H5>Performance</H5>
          <p className="text-muted-foreground text-xs">Last 30 days</p>
        </div>

        <QueryCell
          query={statsQuery}
          pending={() => <Skeleton className="h-64" />}
          error={() => <p className="text-muted-foreground text-sm">Could not load stats.</p>}
          success={({ data }) => <StatsBody stats={data} />}
        />
      </Card.Section>
    </Card>
  )
}

const StatsBody = ({ stats }: { stats: Stats }) => {
  const { rows, totals } = stats
  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : null

  return (
    <>
      <div className="grid grid-cols-3 divide-x rounded-lg border">
        <StatTile label="Impressions" value={formatNumber(totals.impressions, "standard")} />
        <StatTile label="Clicks" value={formatNumber(totals.clicks, "standard")} />
        <StatTile label="CTR" value={ctr === null ? "—" : `${ctr.toFixed(2)}%`} />
      </div>

      {rows.length > 0 ? (
        <PerformanceChart rows={rows} />
      ) : (
        <div className="bg-dashed flex h-32 items-center justify-center rounded-lg border">
          <p className="rounded-md bg-background px-3 py-1.5 text-muted-foreground text-sm">
            No traffic recorded yet — stats appear once the ad starts serving.
          </p>
        </div>
      )}
    </>
  )
}

const StatTile = ({
  label,
  value,
  className,
  ...props
}: ComponentProps<"div"> & {
  label: string
  value: string
}) => {
  return (
    <div className={cx("min-w-0 p-4", className)} {...props}>
      <p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
      <p className="mt-1 truncate font-display text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}
