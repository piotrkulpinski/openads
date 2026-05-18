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

export const recordAdImpression = async ({
  db,
  redis,
  clientIp,
  adId,
}: RecordAdEventProps): Promise<RecordAdEventResult> => {
  const ad = await db.ad.findUnique({ where: { id: adId }, select: { id: true } })
  if (!ad) return { success: false }

  const limited = await isRateLimited({
    redis,
    clientIp,
    adId,
    event: "impression",
    limit: IMPRESSION_LIMIT_PER_MINUTE,
  })
  if (limited) return { success: false }

  await db.adStat.upsert({
    where: { adId_date: { adId, date: getTodayBucket() } },
    create: { adId, date: getTodayBucket(), impressions: 1, clicks: 0 },
    update: { impressions: { increment: 1 } },
  })

  return { success: true }
}

export const recordAdClick = async ({
  db,
  redis,
  clientIp,
  adId,
}: RecordAdEventProps): Promise<RecordAdEventResult> => {
  const ad = await db.ad.findUnique({ where: { id: adId }, select: { id: true } })
  if (!ad) return { success: false }

  const limited = await isRateLimited({
    redis,
    clientIp,
    adId,
    event: "click",
    limit: CLICK_LIMIT_PER_MINUTE,
  })
  if (limited) return { success: false }

  await db.adStat.upsert({
    where: { adId_date: { adId, date: getTodayBucket() } },
    create: { adId, date: getTodayBucket(), impressions: 0, clicks: 1 },
    update: { clicks: { increment: 1 } },
  })

  return { success: true }
}
