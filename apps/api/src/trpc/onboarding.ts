import { ONBOARDING_STEPS } from "@openads/utils"
import { z } from "zod"
import { authProcedure, router } from "~/trpc"

export const onboardingRouter = router({
  setProgress: authProcedure
    .input(z.object({ step: z.enum(ONBOARDING_STEPS).nullable() }))
    .mutation(async ({ ctx: { redis, userId }, input: { step } }) => {
      try {
        await redis.set(`onboarding-step:${userId}`, step)
      } catch (e) {
        console.error("Failed to update onboarding step", e)
        throw new Error("Failed to update onboarding step")
      }

      return { success: true }
    }),
})
