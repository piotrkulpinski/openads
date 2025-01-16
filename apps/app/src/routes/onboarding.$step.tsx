import { ONBOARDING_STEPS } from "@openads/utils"
import { createFileRoute } from "@tanstack/react-router"
import { LoaderIcon } from "lucide-react"
import { z } from "zod"
import { OnboardingLaterButton } from "~/components/onboarding/later-button"
import { OnboardingStep } from "~/components/onboarding/step"
import { QueryCell } from "~/components/query-cell"
import { SpotForm } from "~/components/spots/spot-form"
import { CreateWorkspaceForm } from "~/components/workspaces/create-workspace-form"
import { useOnboardingProgress } from "~/hooks/use-onboarding-progress"
import { trpc } from "~/lib/trpc"

export const Route = createFileRoute("/onboarding/$step")({
  params: {
    parse: p => z.object({ step: z.enum(ONBOARDING_STEPS) }).parse(p),
  },

  validateSearch: z.object({
    workspace: z.string().optional(),
  }),

  component: OnboardingStepPage,
})

function OnboardingStepPage() {
  const { step } = Route.useParams()
  const { workspace: slug } = Route.useSearch()
  const { continueTo } = useOnboardingProgress()

  const query = trpc.workspace.getBySlug.useQuery({ slug: slug! }, { enabled: !!slug })

  switch (step) {
    case "workspace":
      return (
        <OnboardingStep
          title="Create your workspace"
          description="For example, you can use the name of your company or department."
        >
          <CreateWorkspaceForm onSuccess={({ slug }) => continueTo("spot", { slug })} />
        </OnboardingStep>
      )

    case "spot":
      return (
        <OnboardingStep
          title="Create your first ad spot"
          description="For example, you can use the name of your company or department."
        >
          <QueryCell
            query={query}
            pending={() => <LoaderIcon className="mx-auto animate-spin" />}
            success={({ data }) => (
              <SpotForm workspaceId={data?.id} onSuccess={() => continueTo("plan", { slug })}>
                <OnboardingLaterButton next="plan" slug={slug} />
              </SpotForm>
            )}
          />
        </OnboardingStep>
      )
  }
}
