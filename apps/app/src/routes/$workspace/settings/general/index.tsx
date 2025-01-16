import { createFileRoute } from "@tanstack/react-router"
import { Section } from "~/components/ui/section"
// import { SettingsProvider } from "~/providers/SettingsProvider"

export const Route = createFileRoute("/$workspace/settings/general/")({
  component: SettingsGeneralPage,
})

function SettingsGeneralPage() {
  return (
    <Section>
      {/* <SettingsProvider>
        <GeneralForm />
      </SettingsProvider>

      <SettingsProvider>
        <AppearanceForm />
      </SettingsProvider>

      <DeleteForm /> */}
      settings
    </Section>
  )
}
