"use client"

import { Button, type ButtonProps } from "@openads/ui/button"
import type { OnboardingStep } from "~/lib/onboarding/types"
import { useOnboardingProgress } from "./use-onboarding-progress"

export function NextButton({ step, ...props }: { step: OnboardingStep } & ButtonProps) {
  const { continueTo, isLoading, isSuccessful } = useOnboardingProgress()

  return (
    <Button
      variant="default"
      size="lg"
      onClick={() => continueTo(step)}
      isPending={isLoading || isSuccessful}
      {...props}
    />
  )
}
