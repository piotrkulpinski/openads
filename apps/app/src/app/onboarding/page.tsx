import { ArrowRightIcon } from "lucide-react"
import { StepPage } from "~/app/onboarding/step-page"
import { OnboardingNextButton } from "~/components/onboarding/next-button"
import { siteConfig } from "~/config/site"

export default function OnboardingPage() {
  return (
    <StepPage
      title={`Welcome to ${siteConfig.name}`}
      description={`${siteConfig.name} gives you marketing superpowers with short links that stand out.`}
    >
      <OnboardingNextButton step="workspace" suffix={<ArrowRightIcon />}>
        Get started
      </OnboardingNextButton>
    </StepPage>
  )
}
