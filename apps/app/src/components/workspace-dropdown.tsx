"use client"

import type { Workspace } from "@openads/db/client"
import { Avatar, AvatarFallback, AvatarImage } from "@openads/ui/avatar"
import { Button } from "@openads/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@openads/ui/dropdown-menu"
import { useIsMobile } from "@openads/ui/hooks"
import { Skeleton } from "@openads/ui/skeleton"
import { ChevronsUpDown, Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { CreateWorkspaceDialog } from "~/components/workspaces/create-workspace-dialog"

type WorkspaceDropdownProps = {
  workspaces: Workspace[]
}

const WorkspaceDropdown = ({ workspaces }: WorkspaceDropdownProps) => {
  const isMobile = useIsMobile()
  const params = useParams()
  const router = useRouter()
  const activeWorkspace = workspaces.find(w => w.slug === params.workspace)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          <Avatar className="size-6">
            <AvatarImage src={activeWorkspace?.faviconUrl ?? undefined} />
            <AvatarFallback>{activeWorkspace?.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{activeWorkspace?.name}</span>
            {/* <span className="truncate text-xs">{activeWorkspace?.plan}</span> */}
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        align="start"
        side={isMobile ? "bottom" : "right"}
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">Workspaces</DropdownMenuLabel>

        {workspaces.map(workspace => (
          <DropdownMenuItem
            key={workspace.name}
            onClick={() => router.push(`/${workspace.slug}`)}
            className="gap-2 p-2"
            disabled={workspace.id === activeWorkspace?.id}
          >
            <Avatar className="size-6">
              <AvatarImage src={workspace.faviconUrl ?? undefined} />
              <AvatarFallback>{workspace.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {workspace.name}
            {/* <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut> */}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <CreateWorkspaceDialog>
          <DropdownMenuItem className="gap-2 p-2" onSelect={e => e.preventDefault()}>
            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
              <Plus />
            </div>
            Create workspace
          </DropdownMenuItem>
        </CreateWorkspaceDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const WorkspaceDropdownSkeleton = () => {
  return (
    <Button size="sm" variant="outline" disabled>
      <Skeleton className="size-6 rounded-full" />

      <div className="grid flex-1 text-left text-sm leading-tight">
        <Skeleton className="h-4 w-24" />
      </div>

      <ChevronsUpDown className="ml-auto size-4" />
    </Button>
  )
}

export { WorkspaceDropdown, WorkspaceDropdownSkeleton }
