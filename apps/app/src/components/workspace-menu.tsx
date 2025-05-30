import { useHotkeys } from "@mantine/hooks"
import type { Workspace } from "@openads/db/client"
import { Avatar, AvatarFallback, AvatarImage } from "@openads/ui/avatar"
import { buttonVariants } from "@openads/ui/button"
import { cx } from "@openads/ui/cva"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@openads/ui/dropdown-menu"
import { useIsMobile } from "@openads/ui/hooks"
import { Skeleton } from "@openads/ui/skeleton"
import { useNavigate } from "@tanstack/react-router"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { CreateWorkspaceDialog } from "~/components/workspaces/create-workspace-dialog"
import { useWorkspace } from "~/contexts/workspace-context"
import { trpc, trpcUtils } from "~/lib/trpc"
import { getWorkspaceFaviconUrl } from "~/lib/workspaces"

export const WorkspaceMenu = () => {
  const isMobile = useIsMobile()
  const activeWorkspace = useWorkspace()
  const navigate = useNavigate()

  const { data: workspaces, isFetching } = trpc.workspace.getAll.useQuery(undefined, {
    initialData: [],
  })

  const changeDefaultWorkspace = trpc.workspace.changeDefault.useMutation({
    onSuccess: () => {
      trpcUtils.user.me.invalidate()
    },
  })

  const changeWorkspace = (workspace?: Workspace) => {
    if (!workspace || workspace.slug === activeWorkspace.slug) return

    changeDefaultWorkspace.mutate({ workspaceId: workspace.id })
    navigate({ to: "/$workspace", params: { workspace: workspace.slug } })
  }

  useHotkeys(
    [...Array(9).keys()].map(index => [
      `mod+${index + 1}`,
      e => changeWorkspace(workspaces[Number.parseInt(e.key) - 1]),
    ]),
  )

  if (isFetching) {
    return (
      <div
        className={buttonVariants({
          size: "sm",
          variant: "outline",
          className: "gap-2 pointer-events-none",
        })}
      >
        <Skeleton className="size-7 rounded-full" />

        <div className="grid gap-0.5 flex-1 text-left text-sm leading-tight">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>

        <ChevronsUpDown className="size-4" />
      </div>
    )
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={buttonVariants({ size: "sm", variant: "outline", className: "gap-2" })}
      >
        <Avatar className="size-7">
          <AvatarImage src={getWorkspaceFaviconUrl(activeWorkspace)} />
          <AvatarFallback>{activeWorkspace?.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="grid gap-0.5 flex-1 text-left text-sm leading-none">
          <span className="truncate text-sm/tight font-medium">{activeWorkspace?.name}</span>
          <span className="truncate text-xs/tight text-muted-foreground/75 font-normal">
            {activeWorkspace?.plan}
          </span>
        </div>
        <ChevronsUpDown className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 space-y-1 rounded-lg"
        align="start"
        side={isMobile ? "bottom" : "right"}
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">Workspaces</DropdownMenuLabel>

        {workspaces.map((workspace, index) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => changeWorkspace(workspace)}
            className={cx(
              "gap-2 p-2",
              workspace.slug === activeWorkspace.slug && "bg-accent opacity-75 pointer-events-none",
            )}
          >
            <Avatar className="size-7">
              <AvatarImage src={getWorkspaceFaviconUrl(workspace)} />
              <AvatarFallback>{workspace.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="grid gap-0.5 flex-1 text-left text-sm leading-none">
              <span className="truncate text-sm/tight font-medium">{workspace.name}</span>
              <span className="truncate text-xs/tight text-muted-foreground/75 font-normal">
                {workspace.plan}
              </span>
            </div>

            {workspace.slug === activeWorkspace.slug ? (
              <Check className="ml-auto text-green-500" />
            ) : (
              index < 9 && <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
            )}
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
