import { Button } from "@openads/ui/button"
import { Skeleton } from "@openads/ui/skeleton"
import { createFileRoute, Link } from "@tanstack/react-router"
import { PackageIcon, PlusIcon } from "lucide-react"
import { PackageItem } from "~/components/packages/package-item"
import { QueryCell } from "~/components/query-cell"
import { Callout, CalloutText } from "~/components/ui/callout"
import { Header, HeaderActions, HeaderTitle } from "~/components/ui/header"
import { trpc } from "~/lib/trpc"

export const Route = createFileRoute("/$workspaceId/packages/")({
  component: PackagesIndexPage,
})

function PackagesIndexPage() {
  const { workspaceId } = Route.useParams()
  const packagesQuery = trpc.package.getAll.useQuery({ workspaceId })

  return (
    <>
      <Header>
        <HeaderTitle>Packages</HeaderTitle>

        <HeaderActions>
          <Button prefix={<PlusIcon />} asChild>
            <Link to="/$workspaceId/packages/new" params={{ workspaceId }}>
              Create Package
            </Link>
          </Button>
        </HeaderActions>
      </Header>

      <QueryCell
        query={packagesQuery}
        pending={() => [...Array(3)].map((_, i) => <Skeleton key={i} className="h-10" />)}
        error={() => (
          <Callout variant="danger">
            <CalloutText>We could not load packages for this workspace.</CalloutText>
          </Callout>
        )}
        empty={() => (
          <Callout variant="info" prefix={<PackageIcon />}>
            <CalloutText>
              No packages defined yet.{" "}
              <Link to="/$workspaceId/packages/new" params={{ workspaceId }}>
                Create your first package here
              </Link>
              .
            </CalloutText>
          </Callout>
        )}
        success={({ data }) => (
          <div className="flex flex-col divide-y rounded-lg border">
            {data.map(pkg => (
              <PackageItem key={pkg.id} workspaceId={workspaceId} pkg={pkg} />
            ))}
          </div>
        )}
      />
    </>
  )
}
