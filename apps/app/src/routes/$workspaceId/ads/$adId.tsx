import { Badge } from "@openads/ui/badge"
import { Button } from "@openads/ui/button"
import { Stack } from "@openads/ui/stack"
import { Textarea } from "@openads/ui/textarea"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { CheckIcon, MessageSquareIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { AdStats } from "~/components/ads/ad-stats"
import { Card } from "~/components/ui/card"
import { Header, HeaderActions, HeaderTitle } from "~/components/ui/header"
import { H4, H5 } from "~/components/ui/heading"
import { formatTierPrice } from "~/lib/currency"
import { type RouterOutputs, trpc } from "~/lib/trpc"

export const Route = createFileRoute("/$workspaceId/ads/$adId")({
  loader: async ({ context: { trpc: utils }, params: { workspaceId, adId } }) => {
    const [ad, fields] = await Promise.all([
      utils.ad.getById.fetch({ workspaceId, adId }),
      utils.field.getAll.fetch({ workspaceId }),
    ])
    if (!ad) throw notFound()
    return { ad, fields }
  },

  component: AdReviewPage,
})

type Ad = NonNullable<RouterOutputs["ad"]["getById"]>
type FieldList = RouterOutputs["field"]["getAll"]

function AdReviewPage() {
  const { workspaceId, adId } = Route.useParams()
  const { ad: initial, fields } = Route.useLoaderData()
  const utils = trpc.useUtils()

  const adQuery = trpc.ad.getById.useQuery({ workspaceId, adId }, { initialData: initial })
  const ad = (adQuery.data ?? initial) as Ad

  const [note, setNote] = useState("")

  const onMutate = (action: string) => async () => {
    toast.success(`Ad ${action}`)
    await utils.ad.getById.invalidate({ workspaceId, adId })
    await utils.ad.getAll.invalidate({ workspaceId })
  }

  const approve = trpc.ad.approve.useMutation({
    onSuccess: onMutate("approved"),
    onError: e => toast.error(e.message),
  })
  const reject = trpc.ad.reject.useMutation({
    onSuccess: onMutate("rejected"),
    onError: e => toast.error(e.message),
  })
  const requestChanges = trpc.ad.requestChanges.useMutation({
    onSuccess: onMutate("changes requested"),
    onError: e => toast.error(e.message),
  })

  const requireNote = () => {
    if (!note.trim()) {
      toast.error("Add a note explaining the decision.")
      return false
    }
    return true
  }

  return (
    <>
      <Header>
        <HeaderTitle>{ad.name}</HeaderTitle>

        <HeaderActions>
          <Badge>{ad.status}</Badge>
        </HeaderActions>
      </Header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Stack direction="column" size="md">
          <Card>
            <Card.Section>
              <H4>Creative</H4>
              <Stack direction="column" size="sm" className="mt-4">
                <Field label="Destination">
                  <a
                    href={ad.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    {ad.websiteUrl}
                  </a>
                </Field>
                <Field label="Weight">{ad.weight}</Field>
                <Field label="Tier">{ad.subscription.tier.name}</Field>
                <Field label="Billing">{formatTierPrice(ad.subscription.tierPrice)}</Field>
                <Field label="Advertiser">
                  {ad.subscription.advertiser.email ?? ad.subscription.advertiser.name}
                </Field>
              </Stack>

              {ad.meta.length > 0 && (
                <>
                  <H5 className="mt-6">Custom fields</H5>
                  <Stack direction="column" size="sm" className="mt-2">
                    {ad.meta.map(m => (
                      <Field key={m.id} label={fieldLabel(m.fieldId, fields)}>
                        {renderMetaValue(m, fields)}
                      </Field>
                    ))}
                  </Stack>
                </>
              )}
            </Card.Section>
          </Card>

          <AdStats workspaceId={workspaceId} adId={adId} />
        </Stack>

        <Card>
          <Card.Section>
            <H4>Review</H4>
            <p className="mt-2 text-muted-foreground text-sm">
              Approve to start serving. Reject to cancel the subscription. Request changes to keep
              the subscription active and ask the advertiser to resubmit.
            </p>

            <Textarea
              className="mt-4"
              placeholder="Note (optional for approve, required for reject / changes)"
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={500}
            />

            <Stack direction="column" size="sm" className="mt-4">
              <Button
                prefix={<CheckIcon />}
                onClick={() =>
                  approve.mutate({ workspaceId, adId, note: note.trim() || undefined })
                }
                isPending={approve.isPending}
                disabled={ad.status === "Approved"}
              >
                Approve
              </Button>
              <Button
                variant="secondary"
                prefix={<MessageSquareIcon />}
                onClick={() => {
                  if (!requireNote()) return
                  requestChanges.mutate({ workspaceId, adId, note })
                }}
                isPending={requestChanges.isPending}
              >
                Request changes
              </Button>
              <Button
                variant="destructive"
                prefix={<XIcon />}
                onClick={() => {
                  if (!requireNote()) return
                  reject.mutate({ workspaceId, adId, note })
                }}
                isPending={reject.isPending}
                disabled={ad.status === "Rejected"}
              >
                Reject
              </Button>
            </Stack>
          </Card.Section>
        </Card>
      </div>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <span className="text-muted-foreground text-xs uppercase tracking-wide">{label}</span>
      <div className="text-sm">{children}</div>
    </div>
  )
}

function fieldLabel(fieldId: string, fields: FieldList) {
  return fields.find(f => f.id === fieldId)?.name ?? fieldId
}

function renderMetaValue(m: Ad["meta"][number], fields: FieldList) {
  const field = fields.find(f => f.id === m.fieldId)
  const value = m.value as unknown

  if (field?.type === "Image" && typeof value === "string" && value.length > 0) {
    return <img src={value} alt={field.name} className="max-h-32 rounded border object-contain" />
  }

  if (field?.type === "Switch") {
    return value ? "Yes" : "No"
  }

  return String(value ?? "")
}
