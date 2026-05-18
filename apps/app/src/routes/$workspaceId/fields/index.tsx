import { Button } from "@openads/ui/button"
import { Skeleton } from "@openads/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { PlusIcon, Rows3Icon } from "lucide-react"
import { FieldItem } from "~/components/fields/field-item"
import { QueryCell } from "~/components/query-cell"
import { Callout, CalloutText } from "~/components/ui/callout"
import { Header, HeaderActions, HeaderTitle } from "~/components/ui/header"
import { orpc } from "~/lib/orpc"

export const Route = createFileRoute("/$workspaceId/fields/")({
  component: FieldsIndexPage,
})

function FieldsIndexPage() {
  const { workspaceId } = Route.useParams()
  const fieldsQuery = useQuery(orpc.field.getAll.queryOptions({ input: { workspaceId } }))

  return (
    <>
      <Header>
        <HeaderTitle>Custom Fields</HeaderTitle>

        <HeaderActions>
          <Button prefix={<PlusIcon />} asChild>
            <Link to="/$workspaceId/fields/new" params={{ workspaceId }}>
              Create Field
            </Link>
          </Button>
        </HeaderActions>
      </Header>

      <QueryCell
        query={fieldsQuery}
        pending={() => [...Array(3)].map((_, i) => <Skeleton key={i} className="h-10" />)}
        error={() => (
          <Callout variant="danger">
            <CalloutText>We could not load fields for this workspace.</CalloutText>
          </Callout>
        )}
        empty={() => (
          <Callout variant="info" prefix={<Rows3Icon />}>
            <CalloutText>
              No custom fields yet.{" "}
              <Link to="/$workspaceId/fields/new" params={{ workspaceId }}>
                Create your first field here
              </Link>
              . Use these to collect creative content (taglines, banners, discount codes…) from
              advertisers when they subscribe.
            </CalloutText>
          </Callout>
        )}
        success={({ data }) => (
          <div className="flex flex-col divide-y rounded-lg border">
            {data.map(field => (
              <FieldItem key={field.id} workspaceId={workspaceId} field={field} />
            ))}
          </div>
        )}
      />
    </>
  )
}
