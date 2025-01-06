"use client"

import { upperFirst } from "@curiousleaf/utils"
import { Button, type ButtonProps } from "@openads/ui/button"
import { LoaderIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { signIn } from "~/lib/auth/client"
import { cx } from "~/utils/cva"

type LoginButtonProps = ButtonProps & {
  provider: "google" | "github"
}

export const LoginButton = ({
  className,
  provider,
  variant = "outline",
  prefix,
  ...props
}: LoginButtonProps) => {
  const searchParams = useSearchParams()
  const callbackURL = searchParams.get("callbackURL") ?? undefined
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
