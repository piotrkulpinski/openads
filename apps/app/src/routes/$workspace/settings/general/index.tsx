import { createFileRoute } from "@tanstack/react-router"
import { Section } from "~/components/ui/section"
import { DeleteForm } from "~/routes/$workspace/settings/general/-components/delete-form"
import { GeneralForm } from "~/routes/$workspace/settings/general/-components/general-form"
import { IdForm } from "~/routes/$workspace/settings/general/-components/id-form"

export const Route = createFileRoute("/$workspace/settings/general/")({
  component: SettingsGeneralPage,
})

function SettingsGeneralPage() {
  return (
    <Section>
      <GeneralForm />
      <IdForm />
      <DeleteForm />
    </Section>
  )
}
