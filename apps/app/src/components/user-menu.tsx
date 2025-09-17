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
import { BookOpenIcon, BugIcon, LifeBuoyIcon, LogOutIcon } from "lucide-react"
import { authClient } from "~/lib/auth"

export const UserMenu = () => {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()

  if (!session?.user || isPending) {
    return (
      <Avatar className="size-7 -m-1">
        <AvatarFallback />
      </Avatar>
    )
  }

  const handleLogout = () => {
    return authClient.signOut({ fetchOptions: { onSuccess: () => router.invalidate() } })
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

        <DropdownMenuLabel>Resources</DropdownMenuLabel>

        <DropdownMenuItem asChild>
          <a href="#" target="_blank" rel="noopener">
            <BookOpenIcon className="size-4" />
            Docs
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a
            href="https://github.com/piotrkulpinski/openads/issues/new"
            target="_blank"
            rel="noopener"
          >
            <BugIcon className="size-4" />
            Report
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a href="#" target="_blank" rel="noopener">
            <LifeBuoyIcon className="size-4" />
            Support
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout}>
          <LogOutIcon className="size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
