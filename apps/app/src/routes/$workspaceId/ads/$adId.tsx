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
import { type RouterOutputs, trpc } from "~/lib/trpc"

export const Route = createFileRoute("/$workspaceId/ads/$adId")({
  loader: async ({ context: { trpc: utils }, params: { workspaceId, adId } }) => {
    const ad = await utils.ad.getById.fetch({ workspaceId, adId })
    if (!ad) throw notFound()
    return { ad }
  },

  component: AdReviewPage,
})

type Ad = NonNullable<RouterOutputs["ad"]["getById"]>

function AdReviewPage() {
  const { workspaceId, adId } = Route.useParams()
  const { ad: initial } = Route.useLoaderData()
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

      <AdStats workspaceId={workspaceId} adId={adId} />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
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
              <Field label="Description">{ad.description || "—"}</Field>
              <Field label="CTA label">{ad.buttonLabel || "—"}</Field>
              <Field label="Weight">{ad.weight}</Field>
              {ad.faviconUrl && (
                <Field label="Favicon">
                  <img alt="favicon" src={ad.faviconUrl} className="size-8" />
                </Field>
              )}
            </Stack>

            {ad.meta.length > 0 && (
              <>
                <H5 className="mt-6">Custom fields</H5>
                <Stack direction="column" size="sm" className="mt-2">
                  {ad.meta.map(m => (
                    <Field key={m.id} label={m.fieldId}>
                      {String(m.value)}
                    </Field>
                  ))}
                </Stack>
              </>
            )}
          </Card.Section>
        </Card>

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
