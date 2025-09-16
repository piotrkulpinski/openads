import { Button, type ButtonProps } from "@openads/ui/button"
import { ucFirst } from "@primoui/utils"
import { LoaderIcon } from "lucide-react"
import { siteConfig } from "~/config/site"
import { authClient } from "~/lib/auth"

type LoginButtonProps = ButtonProps & {
  provider: "google" | "github"
  callbackURL?: string
}

export const LoginButton = ({
  provider,
  variant = "outline",
  prefix,
  callbackURL = siteConfig.url,
  ...props
}: LoginButtonProps) => {
  // const wasLastUsed = authClient.isLastUsedLoginMethod(provider)
  const isLoading = false

  return (
    <Button
      variant={variant}
      prefix={isLoading ? <LoaderIcon className="animate-spin" /> : prefix}
      onClick={() => authClient.signIn.social({ provider, callbackURL })}
      disabled={isLoading}
      {...props}
    >
      Sign in with {ucFirst(provider)}
      {/*{wasLastUsed && <Badge>Last Used</Badge>}*/}
    </Button>
  )
}
