import { Button } from "@openads/ui/button"
import { Input } from "@openads/ui/input"
import { Skeleton } from "@openads/ui/skeleton"
import { Stack } from "@openads/ui/stack"
import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import { CheckIcon, LayersIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { QueryCell } from "~/components/query-cell"
import { Logo } from "~/components/ui/logo"
import { formatInterval, formatPrice } from "~/lib/currency"
import { parseTierFeature } from "~/lib/tier-features"
import { trpc } from "~/lib/trpc"

const defaultValues = {
  theme: "auto",
} as const

export const Route = createFileRoute("/embed/$slug")({
  validateSearch: z.object({
    theme: z.enum(["auto", "light", "dark"]).catch(defaultValues.theme),
  }),

  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },

  component: TierSelector,
})

function TierSelector() {
  const { slug } = Route.useParams()
  const [email, setEmail] = useState("")
  const [pendingTierPriceId, setPendingTierPriceId] = useState<string | null>(null)

  const tiersQuery = trpc.tier.public.listForWorkspace.useQuery({ slug })

  const checkout = trpc.tier.public.createCheckout.useMutation({
    onSuccess: ({ url }) => {
      window.location.href = url
    },
    onError: error => {
      toast.error(error.message)
      setPendingTierPriceId(null)
    },
  })

  const handleSubscribe = (tierPriceId: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email to continue.")
      return
    }
    setPendingTierPriceId(tierPriceId)
    checkout.mutate({ tierPriceId, email })
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 grid gap-3 text-center">
        <h1 className="font-semibold text-2xl">Advertise on this site</h1>
        <p className="text-muted-foreground text-sm">
          Pick a tier and billing interval below — payment runs through Stripe and your ad goes live
          after a quick review.
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
          <div className="flex flex-col gap-4">
            {data.map(tier => (
              <div key={tier.id} className="rounded-lg border p-4">
                <div className="mb-3">
                  <h2 className="font-medium">{tier.name}</h2>
                  {tier.description && (
                    <p className="mt-1 text-muted-foreground text-sm">{tier.description}</p>
                  )}
                </div>

                {tier.features.length > 0 && (
                  <ul className="mb-3 grid gap-1.5">
                    {tier.features.map((raw, i) => {
                      const { type, label } = parseTierFeature(raw)
                      const Icon = type === "negative" ? XIcon : CheckIcon
                      const iconTone =
                        type === "positive" ? "text-green-600" : "text-muted-foreground"
                      const labelTone =
                        type === "negative" ? "text-muted-foreground line-through" : ""
                      return (
                        // biome-ignore lint/suspicious/noArrayIndexKey: feature list is publisher-defined, stable per render
                        <li key={`${raw}-${i}`} className="flex items-center gap-2 text-sm">
                          <Icon className={`size-3.5 shrink-0 ${iconTone}`} />
                          <span className={labelTone}>{label}</span>
                        </li>
                      )
                    })}
                  </ul>
                )}

                {tier.prices.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic">
                    No prices available for this tier.
                  </p>
                ) : (
                  <Stack direction="column" size="sm">
                    {tier.prices.map(price => (
                      <div
                        key={price.id}
                        className="flex items-center justify-between rounded-md border bg-background px-3 py-2"
                      >
                        <span className="font-medium text-sm">
                          {formatPrice(price.amount, price.currency)} / {formatInterval(price)}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleSubscribe(price.id)}
                          isPending={pendingTierPriceId === price.id && checkout.isPending}
                          prefix={<CheckIcon />}
                        >
                          Subscribe
                        </Button>
                      </div>
                    ))}
                  </Stack>
                )}
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
