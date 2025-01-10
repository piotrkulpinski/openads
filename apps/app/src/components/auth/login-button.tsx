import { upperFirst } from "@curiousleaf/utils"
import { Button, type ButtonProps } from "@openads/ui/button"
import { LoaderIcon } from "lucide-react"
import { useSearchParams } from "react-router"
import { signIn } from "~/lib/auth"

type LoginButtonProps = ButtonProps & {
  provider: "google" | "github"
}

export const LoginButton = ({
  provider,
  variant = "outline",
  prefix,
  ...props
}: LoginButtonProps) => {
  const [searchParams] = useSearchParams()
  const callbackURL = searchParams.get("callbackURL") ?? undefined
  const isLoading = false

  return (
    <Button
      variant={variant}
      prefix={isLoading ? <LoaderIcon className="animate-spin" /> : prefix}
      onClick={() => signIn.social({ provider, callbackURL })}
      disabled={isLoading}
      {...props}
    >
      Sign in with {upperFirst(provider)}
    </Button>
  )
}
