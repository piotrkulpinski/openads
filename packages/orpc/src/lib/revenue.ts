import type { BillingInterval, TierPrice } from "@openads/db/client"

const MONTHS_PER_INTERVAL: Record<BillingInterval, number> = {
  Day: 1 / 30,
  Week: 7 / 30,
  Month: 1,
  Year: 12,
}

/**
 * Normalizes recurring subscription prices to a single monthly figure in
 * cents — the number a publisher actually thinks in. Pass only the
 * subscriptions that should count toward revenue (callers filter by
 * serving status). Assumes one currency per workspace.
 */
export const sumMonthlyCents = (
  subscriptions: Array<{ tierPrice: Pick<TierPrice, "interval" | "intervalCount" | "amount"> }>,
) => {
  const cents = subscriptions.reduce((total, { tierPrice }) => {
    const months = MONTHS_PER_INTERVAL[tierPrice.interval] * tierPrice.intervalCount
    return total + tierPrice.amount / months
  }, 0)

  return Math.round(cents)
}
