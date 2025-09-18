import { z } from "zod"

export const bookingSchema = z
  .object({
    startsAt: z.date(),
    endsAt: z.date(),
    amount: z.number().int().nonnegative(),
    currency: z.string().default("usd"),
    status: z.string().default("pending"),
    spotId: z.string().nonempty("Spot is required"),
  })
  .refine(data => data.endsAt >= data.startsAt, {
    message: "End date cannot be earlier than start date.",
    path: ["endsAt"],
  })

export type BookingSchema = z.infer<typeof bookingSchema>
