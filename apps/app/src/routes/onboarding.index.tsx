import { createFileRoute } from "@tanstack/react-router"
import { ArrowRightIcon } from "lucide-react"
import { OnboardingNextButton } from "~/components/onboarding/next-button"
import { OnboardingStep } from "~/components/onboarding/step"
import { siteConfig } from "~/config/site"

export const Route = createFileRoute("/onboarding/")({
  component: OnboardingPage,
})

function OnboardingPage() {
  return (
    <OnboardingStep
      title={`Welcome to ${siteConfig.name}`}
      description={`${siteConfig.name} is an ad spot management platform, crafted to simplify the process of selling ad spots on your websites.`}
    >
      <OnboardingNextButton
        step="workspace"
        suffix={<ArrowRightIcon />}
        className="text-base min-w-2/3"
      >
        Get started
      </OnboardingNextButton>
    </OnboardingStep>
  )
}
