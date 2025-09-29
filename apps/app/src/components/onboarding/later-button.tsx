import { Button } from "@openads/ui/button"
import type { OnboardingStep } from "@openads/utils"
import type { ComponentProps } from "react"
import { useOnboardingProgress } from "~/hooks/use-onboarding-progress"

type LaterButtonProps = ComponentProps<"button"> & {
  step: OnboardingStep
  slug?: string
}

export function OnboardingLaterButton({ children, step, slug, ...props }: LaterButtonProps) {
  const { continueTo, isPending } = useOnboardingProgress()

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => continueTo(step, slug)}
      isPending={isPending}
      className="mx-auto text-xs text-muted-foreground"
      {...props}
    >
      {children || "I'll do this later"}
    </Button>
  )
}
