import type { Button } from "@openads/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@openads/ui/dropdown-menu"
import { Link, useRouter } from "@tanstack/react-router"
import {
  BookOpenIcon,
  BugIcon,
  ChevronUpIcon,
  LifeBuoyIcon,
  LogOutIcon,
  UserRoundIcon,
} from "lucide-react"
import type { ComponentProps } from "react"
import { NavButton, NavButtonSkeleton } from "~/components/nav-button"
import { useWorkspace } from "~/contexts/workspace-context"
import { authClient } from "~/lib/auth"
import { trpc } from "~/lib/trpc"

export const UserMenu = ({ ...props }: ComponentProps<typeof Button>) => {
  const router = useRouter()
  const workspace = useWorkspace()

  const { data: user, isFetching } = trpc.user.me.useQuery()

  if (!user || isFetching) {
    return <NavButtonSkeleton />
  }

  const handleLogout = () => {
    return authClient.signOut({ fetchOptions: { onSuccess: () => router.invalidate() } })
  }

  const { image, name, email } = user

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <NavButton
          title={name}
          subtitle={email}
          avatar={image ?? undefined}
          suffix={<ChevronUpIcon />}
          {...props}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" side="top" className="w-(--radix-popper-anchor-width)">
        <DropdownMenuLabel>Account</DropdownMenuLabel>

        <DropdownMenuItem asChild>
          <Link to="/$workspace/account" params={{ workspace: workspace.slug }}>
            <UserRoundIcon />
            Account settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
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
