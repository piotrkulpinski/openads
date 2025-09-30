import { ONBOARDING_STEPS } from "@openads/utils"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { ArrowRightIcon, LoaderIcon } from "lucide-react"
import { z } from "zod"
import { OnboardingLaterButton } from "~/components/onboarding/later-button"
import { OnboardingNextButton } from "~/components/onboarding/next-button"
import { OnboardingStep } from "~/components/onboarding/step"
import { QueryCell } from "~/components/query-cell"
import { StripeConnectButtons } from "~/components/stripe/stripe-connect-buttons"
import { CreateWorkspaceForm } from "~/components/workspaces/create-workspace-form"
import { ZoneForm } from "~/components/zones/zone-form"
import { siteConfig } from "~/config/site"
import { useOnboardingProgress } from "~/hooks/use-onboarding-progress"
import { trpc } from "~/lib/trpc"

export const Route = createFileRoute("/_layout/onboarding/$step")({
  params: {
    parse: p => z.object({ step: z.enum(ONBOARDING_STEPS) }).parse(p),
  },

  validateSearch: z.object({
    workspaceId: z.string().optional(),
  }),

  onError: error => {
    if (error?.routerCode === "PARSE_PARAMS") {
      throw notFound()
    }
  },

  component: OnboardingStepPage,
})

function OnboardingStepPage() {
  const { step } = Route.useParams()
  const { workspaceId } = Route.useSearch()
  const { continueTo } = useOnboardingProgress()

  const query = trpc.workspace.getById.useQuery({ id: workspaceId! }, { enabled: !!workspaceId })

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
          <CreateWorkspaceForm onSuccess={({ id }) => continueTo("zone", id)} />
        </OnboardingStep>
      )

    case "zone":
      return (
        <OnboardingStep
          title="Create your first ad zone"
          description="A single ad unit that you can use to display ads on your website. Don't worry, you can always edit it later."
        >
          <QueryCell
            query={query}
            pending={() => <LoaderIcon className="mx-auto animate-spin" />}
            empty={() => <p className="text-red-500">There was an error loading the workspace.</p>}
            success={({ data }) => (
              <ZoneForm workspaceId={data?.id} onSuccess={() => continueTo("stripe", workspaceId)}>
                <OnboardingLaterButton step="stripe" slug={workspaceId} />
              </ZoneForm>
            )}
          />
        </OnboardingStep>
      )

    case "stripe":
      return (
        <OnboardingStep
          title="Connect your Stripe account"
          description="Connect your Stripe account to start receiving payments for your ad zones."
        >
          <QueryCell
            query={query}
            pending={() => <LoaderIcon className="mx-auto animate-spin" />}
            empty={() => <p className="text-red-500">There was an error loading the workspace.</p>}
            success={({ data }) => (
              <div className="space-y-4">
                <StripeConnectButtons workspace={data} />

                <OnboardingLaterButton step="completed" id={workspaceId}>
                  I'll connect Stripe later
                </OnboardingLaterButton>
              </div>
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
    //           <ZoneForm workspaceId={data?.id} onSuccess={() => continueTo("plan", { id })}>
    //             <OnboardingLaterButton step="completed" id={workspaceId}>
    //               I'll pick a plan later
    //             </OnboardingLaterButton>
    //           </ZoneForm>
    //         )}
    //       />
    //     </OnboardingStep>
    //   )
  }
}
