import { Navigate } from "react-router"
import { LoginButton } from "~/components/auth/login-button"
import { Intro, IntroDescription, IntroTitle } from "~/components/intro"
import { siteConfig } from "~/config/site"
import { useSession } from "~/lib/auth"

export default function LoginPage() {
  const { data: session } = useSession()

  if (session?.user) {
    return <Navigate to="/" replace />
  }

  return (
    <Intro alignment="center">
      <IntroTitle>Login to {siteConfig.name}.</IntroTitle>

      <IntroDescription>
        Automate financial tasks, stay organized, and make informed decisions effortlessly.
      </IntroDescription>

      <LoginButton
        provider="google"
        prefix={<img src="/google.svg" alt="" width={20} height={20} />}
        className="mt-6"
      />
    </Intro>
  )
}
