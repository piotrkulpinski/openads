import { z } from "zod"

export const adCreativeSchema = z.object({
  name: z.string().trim().min(2, { message: "Name is too short" }),
  description: z.string().trim().optional(),
  websiteUrl: z.url(),
  buttonLabel: z.string().trim().optional(),
})

export type AdCreativeSchema = z.infer<typeof adCreativeSchema>

export const adReviewSchema = z.object({
  id: z.string().min(1),
  rejectionNote: z.string().trim().optional(),
})

export type AdReviewSchema = z.infer<typeof adReviewSchema>
