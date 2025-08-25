import { ONBOARDING_STEPS, type OnboardingStep } from "@openads/utils"
import { z } from "zod"
import { authProcedure, router } from "../index"

export const onboardingRouter = router({
  setProgress: authProcedure
    .input(z.object({ step: z.enum(ONBOARDING_STEPS) }))
    .mutation(async ({ ctx: { redis, user }, input: { step } }) => {
      return await redis.set(`onboarding-step:${user.id}`, step)
    }),

  getProgress: authProcedure
    .output(z.enum(ONBOARDING_STEPS).nullable())
    .query(async ({ ctx: { redis, user } }) => {
      return (await redis.get(`onboarding-step:${user.id}`)) as OnboardingStep | null
    }),
})
