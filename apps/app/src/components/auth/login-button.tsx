import { ucFirst } from "@dirstack/utils"
import { Button, type ButtonProps } from "@openads/ui/button"
import { siteConfig } from "~/config/site"
import { authClient } from "~/lib/auth"

type LoginButtonProps = ButtonProps & {
  provider: "google"
  callbackURL?: string
}

export const LoginButton = ({
  provider,
  variant = "secondary",
  callbackURL = siteConfig.url,
  ...props
}: LoginButtonProps) => {
  return (
    <Button
      variant={variant}
      onClick={() => authClient.signIn.social({ provider, callbackURL })}
      {...props}
    >
      Sign in with {ucFirst(provider)}
    </Button>
  )
}
