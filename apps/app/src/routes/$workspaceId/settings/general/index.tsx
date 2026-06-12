import { createFileRoute } from "@tanstack/react-router"
import { Section } from "~/components/ui/section"
import { DeleteWorkspaceCard } from "~/routes/$workspaceId/settings/general/-components/delete-card"
import { GeneralForm } from "~/routes/$workspaceId/settings/general/-components/general-form"
import { WorkspaceIdCard } from "~/routes/$workspaceId/settings/general/-components/id-card"
import { StripeConnectCard } from "~/routes/$workspaceId/settings/general/-components/stripe-connect-card"

export const Route = createFileRoute("/$workspaceId/settings/general/")({
  component: SettingsGeneralPage,
})

function SettingsGeneralPage() {
  return (
    <Section className="mx-auto w-full lg:max-w-3xl">
      <GeneralForm />
      <WorkspaceIdCard />
      <StripeConnectCard />
      <DeleteWorkspaceCard />
    </Section>
  )
}
