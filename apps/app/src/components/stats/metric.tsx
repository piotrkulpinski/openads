import { formatNumber } from "@dirstack/utils"
import { cx } from "@openads/ui/cva"
import type { ComponentProps } from "react"

/** Format a click-through rate as a display string, falling back to a dash. */
export const formatCtr = (totals: { impressions: number; clicks: number }) => {
  if (totals.impressions === 0) return "—"
  return `${((totals.clicks / totals.impressions) * 100).toFixed(2)}%`
}

type MetricProps = ComponentProps<"div"> & {
  label: string
  value: string | number
  hint?: string
}

export const Metric = ({ label, value, hint, className, ...props }: MetricProps) => {
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
