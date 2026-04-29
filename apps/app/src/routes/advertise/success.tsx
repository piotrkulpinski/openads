import { createFileRoute } from "@tanstack/react-router"
import { CheckCircle2Icon } from "lucide-react"
import { useState } from "react"
import { z } from "zod"
import { AdForm } from "~/components/ads/ad-form"
import { QueryCell } from "~/components/query-cell"
import { Logo } from "~/components/ui/logo"
import { trpc } from "~/lib/trpc"

export const Route = createFileRoute("/advertise/success")({
  validateSearch: z.object({
    session_id: z.string().optional(),
  }),

  component: AdvertiseSuccess,
})

function AdvertiseSuccess() {
  const { session_id: sessionId } = Route.useSearch()
  const [submitted, setSubmitted] = useState(false)

  const infoQuery = trpc.ad.public.getCheckoutInfo.useQuery(
    { sessionId: sessionId ?? "" },
    { enabled: !!sessionId, retry: 3, retryDelay: 1500 },
  )

  if (!sessionId) {
    return (
      <Centered>
        <p className="text-muted-foreground">Missing checkout session.</p>
      </Centered>
    )
  }

  if (submitted) {
    return (
      <Centered>
        <div className="grid place-items-center gap-3 text-center">
          <CheckCircle2Icon className="size-10 text-green-500" />
          <h1 className="font-semibold text-2xl">Thanks — your ad is in review</h1>
          <p className="max-w-md text-muted-foreground text-sm">
            We've notified the publisher. Your ad will go live as soon as it's approved. You can
            close this window.
          </p>
        </div>
      </Centered>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <div className="mb-8 grid gap-3 text-center">
        <h1 className="font-semibold text-2xl">Set up your ad</h1>
        <p className="text-muted-foreground text-sm">
          Payment confirmed — fill in the details below and your ad will go live after a quick
          review.
        </p>
      </div>

      <QueryCell
        query={infoQuery}
        pending={() => <p className="text-center text-muted-foreground text-sm">Loading…</p>}
        error={() => (
          <p className="text-center text-red-500 text-sm">
            Something went wrong loading your checkout. Please refresh.
          </p>
        )}
        success={({ data }) => (
          <AdForm sessionId={sessionId} info={data} onSuccess={() => setSubmitted(true)} />
        )}
      />

      <div className="mt-10 flex justify-center opacity-80 hover:opacity-100">
        <a href="/" className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Powered by</span>
          <Logo className="h-4 w-auto" />
        </a>
      </div>
    </div>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="grid h-screen place-items-center px-6">{children}</div>
}
