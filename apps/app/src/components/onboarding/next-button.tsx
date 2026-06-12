import { Button } from "@openads/ui/button"
import type { OnboardingStep } from "@openads/utils"
import type { ComponentProps } from "react"
import { useOnboardingProgress } from "~/hooks/use-onboarding-progress"

type OnboardingNextButtonProps = ComponentProps<typeof Button> & {
  step: OnboardingStep
}

export const OnboardingNextButton = ({ step, ...props }: OnboardingNextButtonProps) => {
  const { continueTo, isPending, isSuccess } = useOnboardingProgress()

  return (
    <Button
      size="lg"
      onClick={() => continueTo(step)}
      isPending={isPending || isSuccess}
      {...props}
    />
  )
}
