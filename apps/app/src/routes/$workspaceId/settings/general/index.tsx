import { createFileRoute } from "@tanstack/react-router"
import { Section } from "~/components/ui/section"
import { DeleteForm } from "~/routes/$workspaceId/settings/general/-components/delete-form"
import { GeneralForm } from "~/routes/$workspaceId/settings/general/-components/general-form"
import { IdForm } from "~/routes/$workspaceId/settings/general/-components/id-form"
import { StripeConnectForm } from "~/routes/$workspaceId/settings/general/-components/stripe-connect-form"

export const Route = createFileRoute("/$workspaceId/settings/general/")({
  component: SettingsGeneralPage,
})

function SettingsGeneralPage() {
  return (
    <Section className="mx-auto w-full lg:max-w-3xl">
      <GeneralForm />
      <IdForm />
      <StripeConnectForm />
      <DeleteForm />
    </Section>
  )
}
