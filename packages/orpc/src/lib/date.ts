/**
 * UTC midnight `daysAgo` days back. `AdStat.date` rows are bucketed at UTC
 * midnight on the write path, so every read window must derive its inclusive
 * lower bound from this same function — a drifted copy (local-time midnight,
 * an off-by-one) would silently disagree with the recorded buckets.
 */
export const startOfUtcDay = (daysAgo = 0): Date => {
  const date = new Date()
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() - Math.max(0, daysAgo))
  return date
}
