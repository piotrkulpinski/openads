import { ONBOARDING_STEPS, type OnboardingStep } from "@openads/utils"
import { z } from "zod"
import { authProcedure } from "../index"

export const onboardingRouter = {
  setProgress: authProcedure
    .input(z.object({ step: z.enum(ONBOARDING_STEPS) }))
    .handler(async ({ context: { redis, user }, input: { step } }) => {
      return await redis.set(`onboarding-step:${user.id}`, step)
    }),

  getProgress: authProcedure
    .output(z.enum(ONBOARDING_STEPS).nullable())
    .handler(async ({ context: { redis, user } }) => {
      return (await redis.get(`onboarding-step:${user.id}`)) as OnboardingStep | null
    }),
}
