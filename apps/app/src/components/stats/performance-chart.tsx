import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@openads/ui/chart"
import { cx } from "@openads/ui/cva"
import type { ComponentProps } from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

type PerformanceRow = {
  date: Date
  impressions: number
  clicks: number
}

const chartConfig = {
  impressions: { label: "Impressions", color: "var(--color-chart-2)" },
  clicks: { label: "Clicks", color: "var(--color-chart-1)" },
} satisfies ChartConfig

const tickFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })

type PerformanceChartProps = Omit<ComponentProps<typeof ChartContainer>, "config" | "children"> & {
  rows: PerformanceRow[]
}

export const PerformanceChart = ({ rows, className, ...props }: PerformanceChartProps) => {
  return (
    <ChartContainer
      config={chartConfig}
      className={cx("aspect-auto h-56 w-full", className)}
      {...props}
    >
      <AreaChart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
        <defs>
          <linearGradient id="fillImpressions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-impressions)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-impressions)" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/75" />

        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={48}
          tickFormatter={(date: Date) => tickFormatter.format(date)}
        />

        <ChartTooltip
          cursor={{ className: "stroke-border" }}
          content={({ content: _, ...props }) => (
            <ChartTooltipContent
              {...props}
              labelFormatter={(_, payload) => {
                const date = payload?.[0]?.payload?.date
                return date instanceof Date ? tickFormatter.format(date) : ""
              }}
            />
          )}
        />

        <Area
          dataKey="impressions"
          type="monotone"
          stroke="var(--color-impressions)"
          strokeWidth={1.5}
          fill="url(#fillImpressions)"
        />
        <Area
          dataKey="clicks"
          type="monotone"
          stroke="var(--color-clicks)"
          strokeWidth={1.5}
          fill="transparent"
        />
      </AreaChart>
    </ChartContainer>
  )
}
