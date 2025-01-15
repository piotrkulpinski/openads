import { createFileRoute } from "@tanstack/react-router"
import { ArrowRightIcon } from "lucide-react"
import { OnboardingNextButton } from "~/components/onboarding/next-button"
import { OnboardingStepPage } from "~/components/onboarding/step-page"
import { siteConfig } from "~/config/site"

export const Route = createFileRoute("/onboarding/")({
  component: OnboardingPage,
})

function OnboardingPage() {
  return (
    <OnboardingStepPage
      title={`Welcome to ${siteConfig.name}`}
      description={`${siteConfig.name} gives you marketing superpowers with short links that stand out.`}
    >
      <OnboardingNextButton step="workspace" suffix={<ArrowRightIcon />}>
        Get started
      </OnboardingNextButton>
    </OnboardingStepPage>
  )
}
