import { Button } from "@openads/ui/button"
import type { OnboardingStep } from "@openads/utils"
import type { ComponentProps } from "react"
import { useOnboardingProgress } from "~/hooks/use-onboarding-progress"

type OnboardingNextButtonProps = ComponentProps<typeof Button> & {
  step: OnboardingStep
  slug?: string
}

export function OnboardingNextButton({ step, slug, ...props }: OnboardingNextButtonProps) {
  const { continueTo, isPending, isSuccess } = useOnboardingProgress()

  return (
    <Button
      size="lg"
      onClick={() => continueTo(step, { slug })}
      isPending={isPending || isSuccess}
      {...props}
    />
  )
}
