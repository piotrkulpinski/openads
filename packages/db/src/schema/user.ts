import { z } from "zod"

export const userSchema = z.object({
  name: z.string().trim().min(3, { message: "Name is too short" }),
  image: z.url().trim().optional().or(z.literal("")).or(z.null()),
})

export type UserSchema = z.infer<typeof userSchema>
