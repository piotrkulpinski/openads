import { Button } from "@openads/ui/button"
import { Input } from "@openads/ui/input"
import { Skeleton } from "@openads/ui/skeleton"
import { Stack } from "@openads/ui/stack"
import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import { CheckIcon, LayersIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { QueryCell } from "~/components/query-cell"
import { Logo } from "~/components/ui/logo"
import { trpc } from "~/lib/trpc"

const defaultValues = {
  workspaceId: "",
  theme: "auto",
} as const

export const Route = createFileRoute("/embed")({
  validateSearch: z.object({
    workspaceId: z.string().default(defaultValues.workspaceId),
    theme: z.enum(["auto", "light", "dark"]).catch(defaultValues.theme),
  }),

  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },

  component: TierSelector,
})

const formatPrice = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100)

function TierSelector() {
  const { workspaceId } = Route.useSearch()
  const [email, setEmail] = useState("")
  const [pendingTierId, setPendingTierId] = useState<string | null>(null)

  const tiersQuery = trpc.tier.public.listForWorkspace.useQuery(
    { workspaceId },
    { enabled: !!workspaceId },
  )

  const checkout = trpc.tier.public.createCheckout.useMutation({
    onSuccess: ({ url }) => {
      window.location.href = url
    },
    onError: error => {
      toast.error(error.message)
      setPendingTierId(null)
    },
  })

  if (!workspaceId) {
    return (
      <div className="grid h-screen place-items-center px-6">
        <p className="text-center text-muted-foreground text-sm">
          Missing <code>workspaceId</code> search param.
        </p>
      </div>
    )
  }

  const handleSubscribe = (tierId: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email to continue.")
      return
    }
    setPendingTierId(tierId)
    checkout.mutate({ tierId, email })
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 grid gap-3 text-center">
        <h1 className="font-semibold text-2xl">Advertise on this site</h1>
        <p className="text-muted-foreground text-sm">
          Pick a tier below — payment runs through Stripe and your ad goes live after a quick
          review.
        </p>
      </div>

      <Input
        type="email"
        placeholder="you@company.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        autoComplete="email"
        className="mb-6"
      />

      <QueryCell
        query={tiersQuery}
        pending={() =>
          [...Array(3)].map((_, i) => <Skeleton key={i} className="mb-3 h-24 rounded-lg" />)
        }
        error={() => <p className="text-center text-red-500 text-sm">Could not load tiers.</p>}
        empty={() => (
          <div className="grid place-items-center gap-2 rounded-lg border border-dashed p-12 text-center text-muted-foreground text-sm">
            <LayersIcon />
            <p>No tiers available yet.</p>
          </div>
        )}
        success={({ data }) => (
          <div className="flex flex-col gap-3">
            {data.map(tier => (
              <div
                key={tier.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <h2 className="font-medium">{tier.name}</h2>
                  {tier.description && (
                    <p className="mt-1 text-muted-foreground text-sm">{tier.description}</p>
                  )}
                  <p className="mt-2 font-medium text-sm">
                    {formatPrice(tier.priceMonthly, tier.currency)}/month
                  </p>
                </div>

                <Button
                  onClick={() => handleSubscribe(tier.id)}
                  isPending={pendingTierId === tier.id && checkout.isPending}
                  prefix={<CheckIcon />}
                >
                  Subscribe
                </Button>
              </div>
            ))}
          </div>
        )}
      />

      <Stack size="sm" className="mt-10 justify-center text-center opacity-80 hover:opacity-100">
        <a href="/" className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Powered by</span>
          <Logo className="h-4 w-auto" />
        </a>
      </Stack>
    </div>
  )
}
