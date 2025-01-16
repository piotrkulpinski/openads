import { ONBOARDING_STEPS, type OnboardingStep } from "@openads/utils"
import { z } from "zod"
import { authProcedure, router } from "~/trpc"

export const onboardingRouter = router({
  setProgress: authProcedure
    .input(z.object({ step: z.enum(ONBOARDING_STEPS) }))
    .mutation(async ({ ctx: { redis, userId }, input: { step } }) => {
      return await redis.set(`onboarding-step:${userId}`, step)
    }),

  getProgress: authProcedure
    .output(z.enum(ONBOARDING_STEPS).nullable())
    .query(async ({ ctx: { redis, userId } }) => {
      return (await redis.get(`onboarding-step:${userId}`)) as OnboardingStep | null
    }),
})
