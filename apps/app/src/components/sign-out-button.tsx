"use client"

import { Button } from "@openads/ui/button"
import { LogOutIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { signOut } from "~/lib/auth/client"

export const SignOutButton = () => {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/") } })}
      prefix={<LogOutIcon />}
      className="justify-start"
    >
      Sign Out
    </Button>
  )
}
