import { z } from "zod"

export const spotSchema = z.object({
  name: z.string().min(3, { message: "Name is too short" }),
  description: z.string().nullable().optional(),
  previewUrl: z.string().url().nullable().optional(),
  price: z.number().int().positive().nullable().optional(),
})
