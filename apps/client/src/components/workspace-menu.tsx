import { useMediaQuery } from "@mantine/hooks"
import { Avatar, AvatarFallback, AvatarImage } from "@openads/ui/avatar"
import { Button } from "@openads/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@openads/ui/dropdown-menu"
import { Skeleton } from "@openads/ui/skeleton"
import { ChevronsUpDown, Plus } from "lucide-react"
import { CreateWorkspaceDialog } from "~/components/workspaces/create-workspace-dialog"
import { trpc } from "~/lib/trpc"
import { getWorkspaceFaviconUrl } from "~/lib/workspaces"

export const WorkspaceMenu = () => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  // const params = useParams()
  // const router = useRouter()
  // const pathname = usePathname()

  const { data: workspaces, isPending } = trpc.workspace.getAll.useQuery(undefined, {
    initialData: [],
  })

  // const changeWorkspace = (workspace?: Workspace) => {
  //   if (!workspace || workspace.slug === params.workspace) return

  //   router.push(pathname.replace(`/${params.workspace}`, `/${workspace.slug}`))
  // }

  // useHotkeys(
  //   [...Array(9).keys()].map(index => [
  //     `mod+${index + 1}`,
  //     e => changeWorkspace(workspaces[Number.parseInt(e.key) - 1]),
  //   ]),
  // )

  if (isPending) {
    return (
      <Button size="sm" variant="outline" className="gap-2" disabled>
        <Skeleton className="size-7 rounded-full" />

        <div className="grid gap-0.5 flex-1 text-left text-sm leading-tight">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3.5 w-16" />
        </div>

        <ChevronsUpDown className="ml-auto size-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Avatar className="size-7">
            <AvatarImage src={getWorkspaceFaviconUrl(workspaces[0])} />
            <AvatarFallback>{workspaces[0]?.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="grid gap-0.5 flex-1 text-left text-sm leading-none">
            <span className="truncate font-medium">{workspaces[0]?.name}</span>
            <span className="truncate text-xs text-muted-foreground/75 font-normal">Free</span>
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

        {workspaces.map((workspace, index) => (
          <DropdownMenuItem
            key={workspace.name}
            // onClick={() => changeWorkspace(workspace)}
            className="gap-2 p-2"
            // disabled={workspace.id === activeWorkspace?.id}
          >
            <Avatar className="size-7">
              <AvatarImage src={getWorkspaceFaviconUrl(workspace)} />
              <AvatarFallback>{workspace.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="grid gap-0.5 flex-1 text-left text-sm leading-none">
              <span className="truncate font-medium">{workspace.name}</span>
              <span className="truncate text-xs text-muted-foreground/75 font-normal">Free</span>
            </div>

            {index < 9 && <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>}
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
