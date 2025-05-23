import { Avatar, AvatarFallback, AvatarImage } from "@openads/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@openads/ui/dropdown-menu"
import { useRouter } from "@tanstack/react-router"
import { LogOutIcon } from "lucide-react"
import { signOut, useSession } from "~/lib/auth"

export const UserMenu = () => {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  if (!session?.user || isPending) {
    return (
      <Avatar className="size-7 -m-1">
        <AvatarFallback />
      </Avatar>
    )
  }

  const handleLogout = () => {
    return signOut({ fetchOptions: { onSuccess: () => router.invalidate() } })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer" asChild>
        <Avatar className="size-7 -m-1">
          <AvatarImage src={session.user.image ?? undefined} />
          <AvatarFallback className="text-xs">{session.user.name?.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="bottom" align="start">
        <DropdownMenuLabel className="font-normal">
          <div>
            <p className="truncate text-sm font-medium">{session.user.name}</p>
            <p className="truncate text-sm text-muted-foreground">{session.user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout}>
          <LogOutIcon className="size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
