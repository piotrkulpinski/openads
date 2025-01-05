"use client"

import { upperFirst } from "@curiousleaf/utils"
import { Button, type ButtonProps } from "@openads/ui/button"
import { LoaderIcon } from "lucide-react"
import { signIn } from "~/lib/auth/client"
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
  const isLoading = false

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
