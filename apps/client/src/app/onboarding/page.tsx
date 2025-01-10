import { ArrowRightIcon } from "lucide-react"
import { Intro, IntroDescription, IntroTitle } from "~/components/intro"
import { OnboardingButton } from "~/components/onboarding-button"
import { siteConfig } from "~/config/site"

export default function OnboardingPage() {
  return (
    <Intro alignment="center">
      <IntroTitle>Welcome to {siteConfig.name}</IntroTitle>

      <IntroDescription>
        {siteConfig.name} gives you marketing superpowers with short links that stand out.
      </IntroDescription>

      <OnboardingButton step="workspace" suffix={<ArrowRightIcon />} className="mt-6">
        Get started
      </OnboardingButton>
    </Intro>
  )
}
