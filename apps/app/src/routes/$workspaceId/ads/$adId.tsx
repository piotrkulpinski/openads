import { formatDate, getInitials, isValidUrl } from "@dirstack/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@openads/ui/avatar"
import { Badge } from "@openads/ui/badge"
import { Button } from "@openads/ui/button"
import { Textarea } from "@openads/ui/textarea"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { ArrowUpRightIcon, CheckIcon, MessageSquareIcon, XIcon } from "lucide-react"
import { type ReactNode, useState } from "react"
import { toast } from "sonner"
import { AdStats } from "~/components/ads/ad-stats"
import { getServingState, ServingDot } from "~/components/ads/serving-state"
import { Card } from "~/components/ui/card"
import { Header, HeaderActions, HeaderTitle } from "~/components/ui/header"
import { H5, H6 } from "~/components/ui/heading"
import { formatTierPrice } from "~/lib/currency"
import { orpc, queryClient, type RouterOutputs } from "~/lib/orpc"

export const Route = createFileRoute("/$workspaceId/ads/$adId")({
  loader: async ({ context: { orpc, queryClient }, params: { workspaceId, adId } }) => {
    const [ad, fields] = await Promise.all([
      queryClient.fetchQuery(orpc.ad.getById.queryOptions({ input: { workspaceId, adId } })),
      queryClient.fetchQuery(orpc.field.getAll.queryOptions({ input: { workspaceId } })),
    ])
    if (!ad) throw notFound()
    return { ad, fields }
  },

  component: AdReviewPage,
})

type Ad = NonNullable<RouterOutputs["ad"]["getById"]>
type FieldList = RouterOutputs["field"]["getAll"]

const statusVariant: Record<Ad["status"], "secondary" | "success" | "danger"> = {
  Pending: "secondary",
  Approved: "success",
  Rejected: "danger",
}

const subscriptionVariant: Record<
  Ad["subscription"]["status"],
  "secondary" | "success" | "warning" | "danger"
> = {
  Trialing: "success",
  Active: "success",
  PastDue: "warning",
  Canceled: "secondary",
  Unpaid: "danger",
  Incomplete: "warning",
  IncompleteExpired: "secondary",
  Paused: "secondary",
}

const faviconUrl = (websiteUrl: string) => {
  try {
    return `https://www.google.com/s2/favicons?sz=128&domain=${new URL(websiteUrl).hostname}`
  } catch {
    return undefined
  }
}

function AdReviewPage() {
  const { workspaceId, adId } = Route.useParams()
  const { ad: initial, fields } = Route.useLoaderData()

  const adQuery = useQuery(
    orpc.ad.getById.queryOptions({ input: { workspaceId, adId }, initialData: initial }),
  )
  const ad = adQuery.data ?? initial
  const serving = getServingState(ad)

  const [note, setNote] = useState("")

  const onDecided = (action: string) => async () => {
    toast.success(`Ad ${action}`)
    setNote("")
    await queryClient.invalidateQueries({
      queryKey: orpc.ad.getById.key({ input: { workspaceId, adId } }),
    })
    await queryClient.invalidateQueries({
      queryKey: orpc.ad.getAll.key({ input: { workspaceId } }),
    })
  }

  const approve = useMutation(
    orpc.ad.approve.mutationOptions({
      onSuccess: onDecided("approved"),
      onError: e => toast.error(e.message),
    }),
  )
  const reject = useMutation(
    orpc.ad.reject.mutationOptions({
      onSuccess: onDecided("rejected"),
      onError: e => toast.error(e.message),
    }),
  )
  const requestChanges = useMutation(
    orpc.ad.requestChanges.mutationOptions({
      onSuccess: onDecided("changes requested"),
      onError: e => toast.error(e.message),
    }),
  )

  const requireNote = () => {
    if (!note.trim()) {
      toast.error("Add a note explaining the decision.")
      return false
    }
    return true
  }

  const { subscription } = ad
  const { advertiser, tier, tierPrice } = subscription

  return (
    <>
      <Header>
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-11 rounded-md border">
            <AvatarImage src={faviconUrl(ad.websiteUrl)} className="p-1.5" />
            <AvatarFallback className="rounded-none">{getInitials(ad.name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <HeaderTitle className="truncate">{ad.name}</HeaderTitle>
            <p className="truncate text-muted-foreground text-sm">
              Submitted {formatDate(ad.createdAt, "medium", "en-US")} ·{" "}
              {advertiser.email ?? advertiser.name} · {tier.name}
            </p>
          </div>
        </div>

        <HeaderActions>
          <Badge variant={statusVariant[ad.status]} size="lg">
            {ad.status}
          </Badge>

          {isValidUrl(ad.websiteUrl) && (
            <Button variant="secondary" suffix={<ArrowUpRightIcon />} asChild>
              <a href={ad.websiteUrl} target="_blank" rel="noreferrer">
                Visit site
              </a>
            </Button>
          )}
        </HeaderActions>
      </Header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Card className="animate-slide-up-and-fade [animation-fill-mode:backwards]">
            <Card.Section className="gap-4">
              <H5>Creative</H5>

              <dl className="divide-y divide-border/60">
                <DetailRow label="Destination">
                  {isValidUrl(ad.websiteUrl) ? (
                    <a
                      href={ad.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex max-w-full items-center gap-1 font-medium underline decoration-border underline-offset-4 hover:decoration-foreground"
                    >
                      <span className="truncate">{ad.websiteUrl}</span>
                      <ArrowUpRightIcon className="shrink-0 text-muted-foreground" />
                    </a>
                  ) : (
                    <span className="block truncate">{ad.websiteUrl}</span>
                  )}
                </DetailRow>

                <DetailRow label="Tier">
                  <span className="flex flex-wrap items-center gap-2">
                    {tier.name}
                    <Badge variant="soft" className="tabular-nums">
                      {tier.weight}× weight
                    </Badge>
                  </span>
                </DetailRow>

                <DetailRow label="Billing">
                  <span className="flex flex-wrap items-center gap-2 tabular-nums">
                    {formatTierPrice(tierPrice)}
                    <Badge variant={subscriptionVariant[subscription.status]}>
                      {subscription.status}
                    </Badge>
                    {subscription.currentPeriodEnd &&
                      ["Active", "Trialing"].includes(subscription.status) && (
                        <span className="text-muted-foreground">
                          {subscription.cancelAtPeriodEnd ? "ends" : "renews"}{" "}
                          {formatDate(subscription.currentPeriodEnd, "medium", "en-US")}
                        </span>
                      )}
                  </span>
                </DetailRow>

                <DetailRow label="Advertiser">
                  <Link
                    to="/$workspaceId/advertisers/$advertiserId"
                    params={{ workspaceId, advertiserId: advertiser.id }}
                    className="font-medium underline decoration-border underline-offset-4 hover:decoration-foreground"
                  >
                    {advertiser.email ?? advertiser.name}
                  </Link>
                </DetailRow>
              </dl>
            </Card.Section>

            <Card.Section className="gap-4">
              <div className="flex items-center gap-2">
                <H5>Custom fields</H5>
                <Badge variant="secondary">{ad.meta.length}</Badge>
              </div>

              {fields.length === 0 && ad.meta.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  This workspace has no custom fields.
                </p>
              ) : (
                <dl className="divide-y divide-border/60">
                  {fields.map(field => (
                    <DetailRow key={field.id} label={field.name}>
                      <MetaValue
                        meta={ad.meta.find(m => m.fieldId === field.id)}
                        type={field.type}
                        name={field.name}
                      />
                    </DetailRow>
                  ))}

                  {/* Values whose field has since been deleted */}
                  {ad.meta
                    .filter(m => !fields.some(f => f.id === m.fieldId))
                    .map(m => (
                      <DetailRow key={m.id} label="Removed field">
                        <MetaValue meta={m} type="Text" name="Removed field" />
                      </DetailRow>
                    ))}
                </dl>
              )}
            </Card.Section>
          </Card>

          <AdStats
            workspaceId={workspaceId}
            adId={adId}
            className="animate-slide-up-and-fade [animation-delay:75ms] [animation-fill-mode:backwards]"
          />
        </div>

        <Card className="animate-slide-up-and-fade lg:sticky lg:top-6 [animation-delay:150ms] [animation-fill-mode:backwards]">
          <Card.Section className="gap-4">
            <div className="flex items-center gap-2.5">
              <ServingDot state={serving} />
              <H5>{serving.label}</H5>
            </div>

            <p className="-mt-2.5 text-muted-foreground text-sm">{serving.detail}</p>

            <dl className="divide-y divide-border/60 text-sm">
              <TimelineRow label="Submitted" date={ad.createdAt} />
              {ad.approvedAt && <TimelineRow label="Approved" date={ad.approvedAt} />}
              {ad.rejectedAt && <TimelineRow label="Rejected" date={ad.rejectedAt} />}
            </dl>

            {ad.rejectionNote && (
              <div className="rounded-md bg-muted px-3 py-2.5">
                <H6 className="text-muted-foreground">Last review note</H6>
                <p className="mt-1 text-sm">{ad.rejectionNote}</p>
              </div>
            )}
          </Card.Section>

          <Card.Section className="gap-4">
            <H5>Decision</H5>

            <div>
              <Textarea
                placeholder="Note to the advertiser…"
                value={note}
                onChange={e => setNote(e.target.value)}
                maxLength={500}
              />
              <p className="mt-1.5 text-muted-foreground text-xs">
                Optional for approve, required otherwise. The note is emailed to the advertiser.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                prefix={<CheckIcon />}
                onClick={() =>
                  approve.mutate({ workspaceId, adId, note: note.trim() || undefined })
                }
                isPending={approve.isPending}
                disabled={ad.status === "Approved"}
                className="w-full"
              >
                Approve
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  prefix={<MessageSquareIcon />}
                  onClick={() => {
                    if (!requireNote()) return
                    requestChanges.mutate({ workspaceId, adId, note })
                  }}
                  isPending={requestChanges.isPending}
                >
                  Changes
                </Button>
                <Button
                  variant="secondary"
                  prefix={<XIcon />}
                  onClick={() => {
                    if (!requireNote()) return
                    reject.mutate({ workspaceId, adId, note })
                  }}
                  isPending={reject.isPending}
                  disabled={ad.status === "Rejected"}
                  className="text-destructive hover:text-destructive"
                >
                  Reject
                </Button>
              </div>

              <p className="text-muted-foreground text-xs">
                Rejecting cancels the subscription. Requesting changes keeps it active and asks the
                advertiser to resubmit.
              </p>
            </div>
          </Card.Section>
        </Card>
      </div>
    </>
  )
}

const DetailRow = ({ label, children }: { label: string; children: ReactNode }) => {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-start gap-x-4 py-2.5 text-sm first:pt-0 last:pb-0">
      <dt className="py-px text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}

const TimelineRow = ({ label, date }: { label: string; date: Date }) => {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 first:pt-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{formatDate(date, "medium", "en-US")}</dd>
    </div>
  )
}

type MetaValueProps = {
  meta: Ad["meta"][number] | undefined
  type: FieldList[number]["type"]
  name: string
}

const MetaValue = ({ meta, type, name }: MetaValueProps) => {
  const value = meta?.value as unknown

  if (value === undefined || value === null || value === "") {
    return <span className="text-muted-foreground">—</span>
  }

  if (type === "Image" && typeof value === "string" && isValidUrl(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="inline-block rounded-lg border bg-dashed p-1.5 hover:border-ring"
      >
        <img src={value} alt={name} className="max-h-36 rounded-sm object-contain" />
      </a>
    )
  }

  if (type === "Switch") {
    return <Badge variant="soft">{value ? "Yes" : "No"}</Badge>
  }

  if (type === "Url" && typeof value === "string" && isValidUrl(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="inline-flex max-w-full items-center gap-1 underline decoration-border underline-offset-4 hover:decoration-foreground"
      >
        <span className="truncate">{value}</span>
        <ArrowUpRightIcon className="shrink-0 text-muted-foreground" />
      </a>
    )
  }

  if (type === "Number") {
    return <span className="tabular-nums">{String(value)}</span>
  }

  return <span className="whitespace-pre-line">{String(value)}</span>
}
