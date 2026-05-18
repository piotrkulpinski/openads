import { db } from "@openads/db"
import { findServingAds } from "@openads/trpc/lib/ad-serving"
import { recordAdClick, recordAdImpression } from "@openads/trpc/lib/ad-tracking"
import { Hono } from "hono"
import { z } from "zod"
import { redis } from "~/services/redis"

const currentAdsQuerySchema = z.object({
  weightGte: z.coerce.number().positive().optional(),
  excludeIds: z
    .string()
    .optional()
    .transform(value => {
      if (!value) return []
      return value
        .split(",")
        .map(id => id.trim())
        .filter(Boolean)
    }),
  count: z.coerce.number().int().min(1).max(20).default(1),
})

const getClientIp = (request: Request): string | null => {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null
  )
}

export const v1Route = new Hono()

v1Route.get("/workspaces/:slug/ads/current", async context => {
  const parsed = currentAdsQuerySchema.safeParse(context.req.query())

  if (!parsed.success) {
    return context.json({ error: "invalid query" }, 400)
  }

  const workspace = await db.workspace.findUnique({
    where: { slug: context.req.param("slug") },
    select: { id: true },
  })

  if (!workspace) {
    return context.json({ error: "workspace not found" }, 404)
  }

  const ads = await findServingAds({
    db,
    workspaceId: workspace.id,
    weightGte: parsed.data.weightGte,
    excludeIds: parsed.data.excludeIds,
    count: parsed.data.count,
  })

  return context.json({
    ad: ads[0] ?? null,
    ads,
  })
})

v1Route.post("/ads/:adId/impression", async context => {
  const result = await recordAdImpression({
    db,
    redis,
    clientIp: getClientIp(context.req.raw),
    adId: context.req.param("adId"),
  })

  return context.json(result)
})

v1Route.post("/ads/:adId/click", async context => {
  const result = await recordAdClick({
    db,
    redis,
    clientIp: getClientIp(context.req.raw),
    adId: context.req.param("adId"),
  })

  return context.json(result)
})
