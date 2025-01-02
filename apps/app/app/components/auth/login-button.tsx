import { upperFirst } from "@curiousleaf/utils"
import { useRouterState } from "@tanstack/react-router"
import { LoaderIcon } from "lucide-react"
import { Button, type ButtonProps } from "~/components/ui/button"
import { signIn } from "~/lib/auth.client"
import { cx } from "~/utils/cva"

type LoginButtonProps = ButtonProps & {
  provider: "google" | "github"
  callbackURL?: string
}

export const LoginButton = ({
  className,
  provider,
  variant = "outline",
  prefix,
  callbackURL,
  ...props
}: LoginButtonProps) => {
  const isLoading = useRouterState({ select: s => s.isLoading })

  return (
    <Button
      variant={variant}
      prefix={isLoading ? <LoaderIcon className="animate-spin" /> : prefix}
      onClick={() => signIn.social({ provider, callbackURL })}
      className={cx("w-full", className)}
      disabled={isLoading}
      {...props}
    >
      Continue with {upperFirst(provider)}
    </Button>
  )
}
