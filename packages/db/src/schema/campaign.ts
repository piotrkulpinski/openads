import { z } from "zod"

export const campaignBaseSchema = z.object({
  startsAt: z.date(),
  endsAt: z.date(),
  amount: z.number().int().nonnegative(),
  currency: z.string().default("usd"),
  status: z.string().default("pending"),
  zoneId: z.string().nonempty("Zone is required"),
})

export const campaignSchema = campaignBaseSchema.refine(data => data.endsAt >= data.startsAt, {
  message: "End date cannot be earlier than start date.",
  path: ["endsAt"],
})

export type CampaignSchema = z.infer<typeof campaignSchema>
