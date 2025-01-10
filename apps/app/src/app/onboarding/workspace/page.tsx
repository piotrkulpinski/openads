import { Intro, IntroDescription, IntroTitle } from "~/components/intro"
import { CreateWorkspaceForm } from "~/components/workspaces/create-workspace-form"
import { useOnboardingProgress } from "~/hooks/use-onboarding-progress"

export default function OnboardingWorkspacePage() {
  const { continueTo } = useOnboardingProgress()

  return (
    <Intro alignment="center">
      <IntroTitle>Create your workspace</IntroTitle>

      <IntroDescription>
        For example, you can use the name of your company or department.
      </IntroDescription>

      <CreateWorkspaceForm
        onSuccess={({ slug }) => continueTo("spot", { slug })}
        className="w-full mt-10"
      />
    </Intro>
  )
}
