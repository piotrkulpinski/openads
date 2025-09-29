import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { LoginButton } from "~/components/auth/login-button"
import { Header, HeaderDescription, HeaderTitle } from "~/components/ui/header"
import { siteConfig } from "~/config/site"

export const Route = createFileRoute("/_layout/login")({
  validateSearch: z.object({
    callbackURL: z.string().optional(),
  }),

  loader: async ({ context }) => {
    const session = await context.trpcUtils.auth.getSession.fetch()

    if (session?.user) {
      throw redirect({ to: "/" })
    }
  },

  component: App,
})

function App() {
  const { callbackURL } = Route.useSearch()

  return (
    <Header gap="sm" alignment="center">
      <HeaderTitle>Login to {siteConfig.name}.</HeaderTitle>
      <HeaderDescription>{siteConfig.tagline}</HeaderDescription>

      <LoginButton
        provider="google"
        callbackURL={callbackURL}
        prefix={<img src="/google.svg" alt="" width={20} height={20} />}
        className="mt-6"
      />
    </Header>
  )
}
