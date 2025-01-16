import { ONBOARDING_STEPS } from "@openads/utils"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { ArrowRightIcon, LoaderIcon } from "lucide-react"
import { z } from "zod"
import { OnboardingLaterButton } from "~/components/onboarding/later-button"
import { OnboardingNextButton } from "~/components/onboarding/next-button"
import { OnboardingStep } from "~/components/onboarding/step"
import { QueryCell } from "~/components/query-cell"
import { SpotForm } from "~/components/spots/spot-form"
import { CreateWorkspaceForm } from "~/components/workspaces/create-workspace-form"
import { siteConfig } from "~/config/site"
import { useOnboardingProgress } from "~/hooks/use-onboarding-progress"
import { trpc } from "~/lib/trpc"

export const Route = createFileRoute("/_layout/onboarding/$step")({
  params: {
    parse: (p) => z.object({ step: z.enum(ONBOARDING_STEPS) }).parse(p),
  },

  validateSearch: z.object({
    workspace: z.string().optional(),
  }),

  onError: (error) => {
    if (error?.routerCode === "PARSE_PARAMS") {
      throw notFound()
    }
  },

  component: OnboardingStepPage,
})

function OnboardingStepPage() {
  const { step } = Route.useParams()
  const { workspace: slug } = Route.useSearch()
  const { continueTo } = useOnboardingProgress()

  const query = trpc.workspace.getBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug },
  )

  switch (step) {
    case "welcome":
      return (
        <OnboardingStep
          title={`Welcome to ${siteConfig.name}`}
          description={siteConfig.description}
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

    case "workspace":
      return (
        <OnboardingStep
          title="Create your workspace"
          description="For example, you can use the name of your company or department."
        >
          <CreateWorkspaceForm
            onSuccess={({ slug }) => continueTo("spot", slug)}
          />
        </OnboardingStep>
      )

    case "spot":
      return (
        <OnboardingStep
          title="Create your first ad spot"
          description="A single ad unit that you can use to display ads on your website. Don't worry, you can always edit it later."
        >
          <QueryCell
            query={query}
            pending={() => <LoaderIcon className="mx-auto animate-spin" />}
            empty={() => (
              <p className="text-red-500">
                There was an error loading the workspace.
              </p>
            )}
            success={({ data }) => (
              <SpotForm
                workspaceId={data?.id}
                onSuccess={() => continueTo("completed", slug)}
              >
                <OnboardingLaterButton step="completed" slug={slug} />
              </SpotForm>
            )}
          />
        </OnboardingStep>
      )

    // case "plan":
    //   return (
    //     <OnboardingStep title="Choose your plan" description="Find a plan that fits your needs.">
    //       <QueryCell
    //         query={query}
    //         pending={() => <LoaderIcon className="mx-auto animate-spin" />}
    //         empty={() => <p className="text-red-500">There was an error loading the workspace.</p>}
    //         success={({ data }) => (
    //           <SpotForm workspaceId={data?.id} onSuccess={() => continueTo("plan", { slug })}>
    //             <OnboardingLaterButton step="completed" slug={slug}>
    //               I'll pick a plan later
    //             </OnboardingLaterButton>
    //           </SpotForm>
    //         )}
    //       />
    //     </OnboardingStep>
    //   )
  }
}
