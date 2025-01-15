import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { LoginButton } from "~/components/auth/login-button"
import { Intro, IntroDescription, IntroTitle } from "~/components/intro"
import { siteConfig } from "~/config/site"

type LoginSearch = {
  callbackURL?: string
}

export const Route = createFileRoute("/login")({
  validateSearch: z.object({
    callbackURL: z.string().optional().default("/"),
  }),

  loader: async ({ context }) => {
    const session = await context.trpcUtils.auth.getSession.fetch()

    if (session?.user) {
      throw redirect({ to: "/" })
    }
  },

  component: () => {
    const { callbackURL } = Route.useSearch()

    return (
      <Intro alignment="center">
        <IntroTitle>Login to {siteConfig.name}.</IntroTitle>

        <IntroDescription>
          Automate financial tasks, stay organized, and make informed decisions effortlessly.
        </IntroDescription>

        <LoginButton
          provider="google"
          callbackURL={callbackURL}
          prefix={<img src="/google.svg" alt="" width={20} height={20} />}
          className="mt-6"
        />
      </Intro>
    )
  },
})
