import { z } from "zod"

export const bookingSchema = z.object({
  startsAt: z.coerce.date().default(new Date()),
  endsAt: z.coerce.date().default(new Date()),
  amount: z.coerce.number().int().nonnegative().default(0),
  currency: z.string().default("usd"),
  status: z.string().default("pending"),
  spotId: z.string(),
})

export type BookingSchema = z.infer<typeof bookingSchema>
