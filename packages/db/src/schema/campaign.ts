import { z } from "zod"

export const campaignSchema = z
  .object({
    startsAt: z.date(),
    endsAt: z.date(),
    amount: z.number().int().nonnegative(),
    currency: z.string().default("usd"),
    status: z.string().default("pending"),
    zoneId: z.string().nonempty("Zone is required"),
  })
  .refine(data => data.endsAt >= data.startsAt, {
    message: "End date cannot be earlier than start date.",
    path: ["endsAt"],
  })

export type CampaignSchema = z.infer<typeof campaignSchema>
