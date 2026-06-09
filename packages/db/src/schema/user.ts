import { z } from "zod"

export const userSchema = z.object({
  name: z.string().trim().min(3, { message: "Name is too short" }),
  image: z.url().or(z.literal("")).nullish(),
})

export type UserSchema = z.infer<typeof userSchema>
