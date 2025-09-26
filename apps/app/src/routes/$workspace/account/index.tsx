import { createFileRoute } from "@tanstack/react-router"
import { Header } from "~/components/ui/header"
import { Section } from "~/components/ui/section"
import { AccountProfileForm } from "./-components/profile-form"

export const Route = createFileRoute("/$workspace/account/")({
  loader: async ({ context }) => {
    const user = await context.trpcUtils.user.me.fetch()

    return { user }
  },

  component: AccountSettingsPage,
})

function AccountSettingsPage() {
  const { user } = Route.useLoaderData()

  return (
    <Section className="mx-auto w-full lg:max-w-3xl">
      <Header
        gap="sm"
        title="Account settings"
        description="Manage your personal details and profile appearance across OpenAds."
      />

      <AccountProfileForm user={user} />
    </Section>
  )
}
