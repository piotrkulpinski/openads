import { Button } from "@openads/ui/button"
import { Skeleton } from "@openads/ui/skeleton"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import { ArrowRightIcon, CheckIcon, LayersIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { QueryCell } from "~/components/query-cell"
import { Logo } from "~/components/ui/logo"
import { siteConfig } from "~/config/site"
import { formatInterval, formatPrice } from "~/lib/currency"
import { orpc } from "~/lib/orpc"
import { parseTierFeature } from "~/lib/tier-features"

// Horizontal cards that stack only when the iframe gets too narrow.
const gridClassName = "grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))]"

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
  const { theme } = Route.useSearch()
  const [pendingTierPriceId, setPendingTierPriceId] = useState<string | null>(null)

  // `auto`/unset falls back to the visitor's OS preference (see styles.css).
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    return () => {
      delete root.dataset.theme
    }
  }, [theme])

  const tiersQuery = useQuery(orpc.tier.public.listForWorkspace.queryOptions({ input: { slug } }))

  const checkout = useMutation(
    orpc.tier.public.createCheckout.mutationOptions({
      onSuccess: ({ url }) => {
        window.location.href = url
      },
      onError: error => {
        toast.error(error.message)
        setPendingTierPriceId(null)
      },
    }),
  )

  const handleSubscribe = (tierPriceId: string) => {
    setPendingTierPriceId(tierPriceId)
    checkout.mutate({ tierPriceId })
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-10 grid gap-3 text-center">
        <h1 className="font-semibold text-2xl">Advertise on this site</h1>
        <p className="mx-auto max-w-xl text-muted-foreground text-sm">
          Pick a plan below — payment runs through Stripe and your ad goes live after a quick
          review.
        </p>
      </div>

      <QueryCell
        query={tiersQuery}
        pending={() => (
          <div className={gridClassName}>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        )}
        error={() => <p className="text-center text-red-500 text-sm">Could not load tiers.</p>}
        empty={() => (
          <div className="grid place-items-center gap-2 rounded-xl border border-dashed p-12 text-center text-muted-foreground text-sm">
            <LayersIcon />
            <p>No tiers available yet.</p>
          </div>
        )}
        success={({ data }) => (
          <div className={gridClassName}>
            {data.map((tier, i) => {
              const headlinePrice = tier.prices[0]
              return (
                <div
                  key={tier.id}
                  className="flex animate-slide-up-and-fade flex-col rounded-xl border bg-card p-6 transition-colors hover:border-ring"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}
                >
                  <h2 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
                    {tier.name}
                  </h2>

                  {headlinePrice && (
                    <p className="mt-3 flex items-baseline gap-1">
                      <span className="font-semibold text-3xl tracking-tight">
                        {formatPrice(headlinePrice.amount, headlinePrice.currency)}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        / {formatInterval(headlinePrice)}
                      </span>
                    </p>
                  )}

                  {tier.description && (
                    <p className="mt-2 text-muted-foreground text-sm">{tier.description}</p>
                  )}

                  {tier.features.length > 0 && (
                    <ul className="mt-5 grid gap-2">
                      {tier.features.map((raw, fi) => {
                        const { type, label } = parseTierFeature(raw)
                        const Icon = type === "negative" ? XIcon : CheckIcon
                        const iconTone =
                          type === "positive" ? "text-green-600" : "text-muted-foreground"
                        const labelTone =
                          type === "negative" ? "text-muted-foreground line-through" : ""
                        return (
                          // biome-ignore lint/suspicious/noArrayIndexKey: feature list is publisher-defined, stable per render
                          <li key={`${raw}-${fi}`} className="flex items-center gap-2 text-sm">
                            <Icon className={`size-4 shrink-0 ${iconTone}`} />
                            <span className={labelTone}>{label}</span>
                          </li>
                        )
                      })}
                    </ul>
                  )}

                  {/* Push the actions to the bottom so buttons align across cards. */}
                  {tier.prices.length === 0 ? (
                    <p className="mt-auto pt-6 text-muted-foreground text-sm italic">
                      No price available for this tier.
                    </p>
                  ) : (
                    <div className="mt-auto grid gap-2 pt-6">
                      {tier.prices.map((price, pi) => (
                        <Button
                          key={price.id}
                          className="w-full"
                          variant={pi === 0 ? "primary" : "secondary"}
                          onClick={() => handleSubscribe(price.id)}
                          isPending={pendingTierPriceId === price.id && checkout.isPending}
                          suffix={pi === 0 ? <ArrowRightIcon /> : undefined}
                        >
                          {pi === 0
                            ? "Subscribe"
                            : `${formatPrice(price.amount, price.currency)} / ${formatInterval(price)}`}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      />

      <div className="mt-10 flex justify-center">
        <a
          href={siteConfig.webUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-muted-foreground text-xs opacity-80 transition-opacity hover:opacity-100"
        >
          <span>Powered by</span>
          <Logo className="h-4 w-auto" />
        </a>
      </div>
    </div>
  )
}
