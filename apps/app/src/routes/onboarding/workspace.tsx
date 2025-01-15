import { createFileRoute } from "@tanstack/react-router"
import { OnboardingStepPage } from "~/components/onboarding/step-page"
import { CreateWorkspaceForm } from "~/components/workspaces/create-workspace-form"
import { useOnboardingProgress } from "~/hooks/use-onboarding-progress"

export const Route = createFileRoute("/onboarding/workspace")({
  component: OnboardingWorkspacePage,
})

function OnboardingWorkspacePage() {
  const { continueTo } = useOnboardingProgress()

  return (
    <OnboardingStepPage
      title="Create your workspace"
      description="For example, you can use the name of your company or department."
    >
      <CreateWorkspaceForm onSuccess={({ slug }) => continueTo("spot", { slug })} />
    </OnboardingStepPage>
  )
}
