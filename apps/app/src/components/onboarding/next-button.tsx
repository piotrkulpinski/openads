import { Button, type ButtonProps } from "@openads/ui/button"
import type { OnboardingStep } from "@openads/utils"
import { useOnboardingProgress } from "~/hooks/use-onboarding-progress"

export function OnboardingNextButton({ step, ...props }: { step: OnboardingStep } & ButtonProps) {
  const { continueTo, isPending, isSuccess } = useOnboardingProgress()

  return (
    <Button
      variant="default"
      size="lg"
      onClick={() => continueTo(step)}
      isPending={isPending || isSuccess}
      {...props}
    />
  )
}
