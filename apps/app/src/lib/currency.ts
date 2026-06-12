import type { BillingInterval } from "@openads/db/client"

/** Convert a whole-unit integer (e.g. `19` for $19) to cents (`1900`). */
export const wholeToCents = (whole: number): number => Math.round(whole * 100)

/** Format cents as a localized currency string. */
export const formatPrice = (cents: number, currency: string): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100)

/**
 * Human label for a billing interval + count pair.
 * e.g. ({Month, 1}) → "month"; ({Month, 3}) → "3 months"; ({Year, 1}) → "year".
 */
export const formatInterval = ({
  interval,
  intervalCount,
}: {
  interval: BillingInterval
  intervalCount: number
}): string => {
  const unit = interval.toLowerCase()
  if (intervalCount === 1) return unit
  return `${intervalCount} ${unit}s`
}

/** Pretty-print a TierPrice as "$19 / month" (or "$199 every 3 months"). */
export const formatTierPrice = (price: {
  amount: number
  currency: string
  interval: BillingInterval
  intervalCount: number
}): string => {
  const amount = formatPrice(price.amount, price.currency)
  const intervalLabel = formatInterval(price)
  return price.intervalCount === 1
    ? `${amount} / ${intervalLabel}`
    : `${amount} every ${intervalLabel}`
}

/** Ordinal weight for interval sorting (Day < Week < Month < Year). */
export const intervalRank = (interval: BillingInterval): number => {
  switch (interval) {
    case "Day":
      return 0
    case "Week":
      return 1
    case "Month":
      return 2
    case "Year":
      return 3
  }
}
