import { Skeleton } from "@openads/ui/skeleton"
import { Stack } from "@openads/ui/stack"
import { QueryCell } from "~/components/query-cell"
import { Card } from "~/components/ui/card"
import { H4 } from "~/components/ui/heading"
import { trpc } from "~/lib/trpc"

interface AdStatsProps {
  workspaceId: string
  adId: string
}

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value)

export function AdStats({ workspaceId, adId }: AdStatsProps) {
  const statsQuery = trpc.ad.getStats.useQuery({ workspaceId, adId, days: 30 })

  return (
    <Card>
      <Card.Section>
        <H4>Stats — last 30 days</H4>

        <QueryCell
          query={statsQuery}
          pending={() => <Skeleton className="mt-4 h-32" />}
          error={() => <p className="mt-4 text-muted-foreground text-sm">Could not load stats.</p>}
          success={({ data }) => (
            <Stack direction="column" size="md" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Tile label="Impressions" value={formatNumber(data.totals.impressions)} />
                <Tile label="Clicks" value={formatNumber(data.totals.clicks)} />
                <Tile
                  label="CTR"
                  value={
                    data.totals.impressions > 0
                      ? `${((data.totals.clicks / data.totals.impressions) * 100).toFixed(2)}%`
                      : "—"
                  }
                />
                <Tile label="Days reporting" value={String(data.rows.length)} />
              </div>

              {data.rows.length > 0 && (
                <table className="w-full text-sm">
                  <thead className="border-b text-muted-foreground text-xs uppercase">
                    <tr>
                      <th className="py-2 text-left">Date</th>
                      <th className="py-2 text-right">Impressions</th>
                      <th className="py-2 text-right">Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map(row => (
                      <tr key={row.date.toISOString()} className="border-b last:border-b-0">
                        <td className="py-2">{row.date.toISOString().slice(0, 10)}</td>
                        <td className="py-2 text-right">{formatNumber(row.impressions)}</td>
                        <td className="py-2 text-right">{formatNumber(row.clicks)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Stack>
          )}
        />
      </Card.Section>
    </Card>
  )
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-md border px-3 py-2">
      <span className="text-muted-foreground text-xs uppercase tracking-wide">{label}</span>
      <span className="font-semibold text-xl">{value}</span>
    </div>
  )
}
