import { z } from "zod"

export const adCreativeSchema = z.object({
  name: z.string().trim().min(2, { message: "Name is too short" }),
  // http(s) only — these URLs render as hrefs in the publisher dashboard
  websiteUrl: z.url({ protocol: /^https?$/, message: "Must be a valid http(s) URL" }),
})

export type AdCreativeSchema = z.infer<typeof adCreativeSchema>

export const adReviewSchema = z.object({
  id: z.string().min(1),
  rejectionNote: z.string().trim().optional(),
})

export type AdReviewSchema = z.infer<typeof adReviewSchema>
