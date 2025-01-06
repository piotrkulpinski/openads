"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@openads/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@openads/ui/dropdown-menu"
import { Skeleton } from "@openads/ui/skeleton"
import { LogOutIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "~/lib/auth/client"

export const UserMenu = () => {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer" asChild>
        <Avatar className="size-7 -m-1">
          <AvatarImage src={session?.user?.image ?? undefined} />
          <AvatarFallback className="text-xs">{session?.user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="bottom" align="start">
        <DropdownMenuLabel>
          {session?.user ? (
            <div>
              <p className="truncate text-sm">
                {session.user.name || session.user.email?.split("@")[0]}
              </p>
              <p className="truncate text-sm font-normal text-muted-foreground">
                {session.user.email}
              </p>
            </div>
          ) : (
            <div className="grid gap-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-20" />
            </div>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/") } })}
        >
          <LogOutIcon className="size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
