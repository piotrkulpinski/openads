import { Button } from "@openads/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@openads/ui/dropdown-menu"
import { useRouter } from "@tanstack/react-router"
import { BookOpenIcon, BugIcon, ChevronUpIcon, LifeBuoyIcon, LogOutIcon } from "lucide-react"
import { ComponentProps } from "react"
import { NavButton, NavButtonSkeleton } from "~/components/nav-button"
import { authClient } from "~/lib/auth"

export const UserMenu = ({ className, ...props }: ComponentProps<typeof Button>) => {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()

  if (!session?.user || isPending) {
    return <NavButtonSkeleton suffix={<ChevronUpIcon />} />
  }

  const handleLogout = () => {
    return authClient.signOut({ fetchOptions: { onSuccess: () => router.invalidate() } })
  }

  const { image, name, email } = session.user

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <NavButton
          title={name}
          subtitle={email}
          avatar={image ?? undefined}
          suffix={<ChevronUpIcon />}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" side="top" className="w-(--radix-popper-anchor-width)">
        <DropdownMenuLabel>Resources</DropdownMenuLabel>

        <DropdownMenuItem asChild>
          <a href="#" target="_blank" rel="noopener">
            <BookOpenIcon />
            Docs
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a
            href="https://github.com/piotrkulpinski/openads/issues/new"
            target="_blank"
            rel="noopener"
          >
            <BugIcon />
            Report
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a href="#" target="_blank" rel="noopener">
            <LifeBuoyIcon />
            Support
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout}>
          <LogOutIcon />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
