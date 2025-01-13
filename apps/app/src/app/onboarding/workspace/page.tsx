import { StepPage } from "~/app/onboarding/step-page"
import { CreateWorkspaceForm } from "~/components/workspaces/create-workspace-form"
import { useOnboardingProgress } from "~/hooks/use-onboarding-progress"

export default function OnboardingWorkspacePage() {
  const { continueTo } = useOnboardingProgress()

  return (
    <StepPage
      title="Create your workspace"
      description="For example, you can use the name of your company or department."
    >
      <CreateWorkspaceForm onSuccess={({ slug }) => continueTo("spot", { slug })} />
    </StepPage>
  )
}
