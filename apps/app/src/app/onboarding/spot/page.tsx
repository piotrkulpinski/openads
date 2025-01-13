import { StepPage } from "~/app/onboarding/step-page"
import { OnboardingLaterButton } from "~/components/onboarding/later-button"

export default function OnboardingSpotPage() {
  return (
    <StepPage
      title="Create your first ad spot"
      description="For example, you can use the name of your company or department."
    >
      <OnboardingLaterButton next="plan" />
    </StepPage>
  )
}
