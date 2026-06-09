import type { db } from "@openads/db"
import type { RedisClient } from "@openads/redis"

const TRACKING_WINDOW_SECONDS = 60
const IMPRESSION_LIMIT_PER_MINUTE = 30
const CLICK_LIMIT_PER_MINUTE = 10

type RecordAdEventProps = {
  db: typeof db
  redis: RedisClient
  clientIp: string | null
  adId: string
}

type RecordAdEventResult = {
  success: boolean
}

const getTodayBucket = (): Date => {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  return today
}

const isRateLimited = async ({
  redis,
  clientIp,
  adId,
  event,
  limit,
}: {
  redis: RedisClient
  clientIp: string | null
  adId: string
  event: "click" | "impression"
  limit: number
}): Promise<boolean> => {
  if (!clientIp) return false

  const rateKey = `ratelimit:${event}:${adId}:${clientIp}`
  const count = await redis.incr(rateKey)
  if (count === 1) await redis.expire(rateKey, TRACKING_WINDOW_SECONDS)

  return count > limit
}

const recordAdEvent = async (
  { db, redis, clientIp, adId }: RecordAdEventProps,
  event: "impression" | "click",
  limit: number,
): Promise<RecordAdEventResult> => {
  const ad = await db.ad.findUnique({ where: { id: adId }, select: { id: true } })
  if (!ad) return { success: false }

  const limited = await isRateLimited({ redis, clientIp, adId, event, limit })
  if (limited) return { success: false }

  const date = getTodayBucket()
  await db.adStat.upsert({
    where: { adId_date: { adId, date } },
    create: {
      adId,
      date,
      impressions: event === "impression" ? 1 : 0,
      clicks: event === "click" ? 1 : 0,
    },
    update:
      event === "impression" ? { impressions: { increment: 1 } } : { clicks: { increment: 1 } },
  })

  return { success: true }
}

export const recordAdImpression = (props: RecordAdEventProps) =>
  recordAdEvent(props, "impression", IMPRESSION_LIMIT_PER_MINUTE)

export const recordAdClick = (props: RecordAdEventProps) =>
  recordAdEvent(props, "click", CLICK_LIMIT_PER_MINUTE)
