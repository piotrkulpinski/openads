import { createFileRoute } from "@tanstack/react-router"
import { OnboardingLaterButton } from "~/components/onboarding/later-button"
import { OnboardingStepPage } from "~/components/onboarding/step-page"

export const Route = createFileRoute("/onboarding/spot")({
  component: OnboardingSpotPage,
})

function OnboardingSpotPage() {
  return (
    <OnboardingStepPage
      title="Create your first ad spot"
      description="For example, you can use the name of your company or department."
    >
      <OnboardingLaterButton next="plan" />
    </OnboardingStepPage>
  )
}
