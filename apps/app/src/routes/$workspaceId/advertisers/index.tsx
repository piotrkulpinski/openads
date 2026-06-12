import { formatDate, getInitials } from "@dirstack/utils"
import { useDebouncedCallback } from "@mantine/hooks"
import { Avatar, AvatarFallback } from "@openads/ui/avatar"
import { Badge } from "@openads/ui/badge"
import { cx } from "@openads/ui/cva"
import { Skeleton } from "@openads/ui/skeleton"
import { Stack } from "@openads/ui/stack"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { SearchIcon, UsersIcon, XIcon } from "lucide-react"
import { type ComponentProps, useRef, useState } from "react"
import { z } from "zod"
import { AdStatusBadge } from "~/components/ads/status-badge"
import { QueryCell } from "~/components/query-cell"
import { Callout, CalloutText } from "~/components/ui/callout"
import { Header, HeaderActions, HeaderTitle } from "~/components/ui/header"
import { H5 } from "~/components/ui/heading"
import { orpc, type RouterOutputs } from "~/lib/orpc"

type Advertiser = RouterOutputs["advertiser"]["getAll"][number]

type AdvertiserSearchProps = {
  value: string
  onChange: (value: string) => void
}

const AdvertiserSearch = ({ value, onChange }: AdvertiserSearchProps) => {
  return (
    <label
      className={cx(
        "group/search flex h-10 w-72 items-center gap-2 rounded-lg border bg-background px-3 shadow-sm outline-transparent transition duration-150",
        "focus-within:border-ring focus-within:outline-[3px] focus-within:outline-border/50",
        "hover:border-ring/60",
      )}
    >
      <SearchIcon className="size-4 shrink-0 text-muted-foreground transition group-focus-within/search:text-foreground" />
      <span className="sr-only">Search advertisers</span>
      <input
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/75"
        placeholder="Search advertisers"
        value={value}
        onChange={event => onChange(event.target.value)}
      />
      {value.length > 0 && (
        <button
          type="button"
          className="relative z-10 -mr-1 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Clear advertiser search"
          onClick={() => onChange("")}
        >
          <XIcon className="size-4" />
        </button>
      )}
    </label>
  )
}

type AdvertiserRowProps = ComponentProps<"div"> & {
  workspaceId: string
  advertiser: Advertiser
}

const AdvertiserRow = ({ workspaceId, advertiser, className, ...props }: AdvertiserRowProps) => {
  return (
    <div
      className={cx(
        "relative flex flex-col gap-3 px-4 py-3 hover:bg-muted/50 md:flex-row md:items-center md:justify-between",
        className,
      )}
      {...props}
    >
      <Link
        to="/$workspaceId/advertisers/$advertiserId"
        params={{ workspaceId, advertiserId: advertiser.id }}
        className="min-w-0 flex-1"
      >
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback>{getInitials(advertiser.name, 3)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <Stack size="sm">
              <H5 className="truncate">{advertiser.name}</H5>
              {advertiser.latestAd && <AdStatusBadge status={advertiser.latestAd.status} />}
            </Stack>
            <p className="truncate text-muted-foreground text-sm">
              {advertiser.email ?? "No email"} · Latest activity{" "}
              {formatDate(advertiser.latestActivityAt, "medium", "en-US")}
            </p>
          </div>
        </div>
        <span className="absolute inset-0" />
      </Link>

      <div className="flex shrink-0 flex-wrap gap-2 pl-12 md:justify-end md:pl-0">
        <Badge variant="secondary">{advertiser.adCount} ads</Badge>
        <Badge variant="secondary">{advertiser.activeSubscriptionCount} active subscriptions</Badge>
        <Badge variant="secondary">{advertiser.activeAdCount} live ads</Badge>
      </div>

      <div className="min-w-0 pl-12 text-sm md:w-56 md:pl-0 md:text-right">
        <p className="truncate font-medium">{advertiser.latestAd?.name ?? "No ad"}</p>
        <p className="truncate text-muted-foreground">
          {advertiser.latestTier?.name ?? "No tier assigned"}
        </p>
      </div>
    </div>
  )
}

const AdvertisersIndexPage = () => {
  const { workspaceId } = Route.useParams()
  const { query } = Route.useSearch()
  const navigate = Route.useNavigate()
  const [search, setSearch] = useState(query ?? "")
  const [lastQuery, setLastQuery] = useState(query)
  const selfQuery = useRef(query)

  // Sync the input when the URL changes externally (e.g. the sidebar link strips
  // ?query= without remounting the route). Our own debounced navigate is skipped
  // so keystrokes typed while it was in flight aren't clobbered.
  if (query !== lastQuery) {
    setLastQuery(query)
    if (query !== selfQuery.current) setSearch(query ?? "")
    selfQuery.current = query
  }

  const navigateDebounced = useDebouncedCallback((value: string) => {
    selfQuery.current = value.trim() || undefined
    navigate({ search: { query: selfQuery.current }, replace: true })
  }, 300)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    navigateDebounced(value)
  }

  const advertisersQuery = useQuery(
    orpc.advertiser.getAll.queryOptions({
      input: { workspaceId, query },
    }),
  )

  return (
    <>
      <Header>
        <HeaderTitle>Advertisers</HeaderTitle>

        <HeaderActions>
          <AdvertiserSearch value={search} onChange={handleSearchChange} />
        </HeaderActions>
      </Header>

      <QueryCell
        query={advertisersQuery}
        pending={() => [...Array(4)].map((_, index) => <Skeleton key={index} className="h-20" />)}
        error={() => (
          <Callout variant="danger">
            <CalloutText>Could not load advertisers.</CalloutText>
          </Callout>
        )}
        empty={() => (
          <Callout variant="info" prefix={<UsersIcon />}>
            <CalloutText>No advertisers yet.</CalloutText>
          </Callout>
        )}
        success={({ data }) => (
          <div className="flex flex-col divide-y rounded-lg border">
            {data.map(advertiser => (
              <AdvertiserRow
                key={advertiser.id}
                workspaceId={workspaceId}
                advertiser={advertiser}
              />
            ))}
          </div>
        )}
      />
    </>
  )
}

export const Route = createFileRoute("/$workspaceId/advertisers/")({
  validateSearch: z.object({
    query: z
      .string()
      .trim()
      .optional()
      .transform(value => value || undefined),
  }),

  component: AdvertisersIndexPage,
})
