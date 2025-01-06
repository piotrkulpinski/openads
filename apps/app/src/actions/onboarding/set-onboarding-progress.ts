"use server"

import { z } from "zod"
import { ONBOARDING_STEPS } from "~/lib/onboarding/types"
import { authActionClient } from "~/lib/safe-action"

export const setOnboardingProgressAction = authActionClient
  .schema(
    z.object({
      onboardingStep: z.enum(ONBOARDING_STEPS).nullable(),
    }),
  )
  .action(async ({ parsedInput: { onboardingStep }, ctx: { redis, user } }) => {
    try {
      await redis.set(`onboarding-step:${user.id}`, onboardingStep)
    } catch (e) {
      console.error("Failed to update onboarding step", e)
      throw new Error("Failed to update onboarding step")
    }

    return { success: true }
  })
