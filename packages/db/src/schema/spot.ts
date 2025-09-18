import { z } from "zod"

export const spotSchema = z.object({
  name: z.string().trim().min(3, { message: "Name is too short" }),
  description: z.string().trim().optional(),
  previewUrl: z.url().optional().or(z.literal("")),
  price: z.number().int().nonnegative(),
})

export type SpotSchema = z.infer<typeof spotSchema>
