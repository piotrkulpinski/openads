import { Button } from "@openads/ui/button"
import { Input } from "@openads/ui/input"
import { Skeleton } from "@openads/ui/skeleton"
import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import { CheckIcon, PackageIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { QueryCell } from "~/components/query-cell"
import { Logo } from "~/components/ui/logo"
import { trpc } from "~/lib/trpc"

const defaultValues = {
  workspaceId: "",
  zoneId: "",
  theme: "auto",
} as const

export const Route = createFileRoute("/embed/packages")({
  validateSearch: z.object({
    workspaceId: z.string().default(defaultValues.workspaceId),
    zoneId: z.string().default(defaultValues.zoneId),
    theme: z.enum(["auto", "light", "dark"]).catch(defaultValues.theme),
  }),

  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },

  component: PackageSelector,
})

const formatPrice = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100)

function PackageSelector() {
  const { workspaceId, zoneId } = Route.useSearch()
  const [email, setEmail] = useState("")
  const [pendingPackageId, setPendingPackageId] = useState<string | null>(null)

  const packagesQuery = trpc.package.public.listForZone.useQuery(
    { workspaceId, zoneId },
    { enabled: !!workspaceId && !!zoneId },
  )

  const checkout = trpc.package.public.createCheckout.useMutation({
    onSuccess: ({ url }) => {
      window.location.href = url
    },
    onError: error => {
      toast.error(error.message)
      setPendingPackageId(null)
    },
  })

  if (!workspaceId || !zoneId) {
    return (
      <div className="grid h-screen place-items-center px-6">
        <p className="text-center text-muted-foreground text-sm">
          Missing <code>workspaceId</code> or <code>zoneId</code> search param.
        </p>
      </div>
    )
  }

  const handleSubscribe = (packageId: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email to continue.")
      return
    }
    setPendingPackageId(packageId)
    checkout.mutate({ packageId, email })
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 grid gap-3 text-center">
        <h1 className="font-semibold text-2xl">Advertise on this site</h1>
        <p className="text-muted-foreground text-sm">
          Pick a package below — payment runs through Stripe and your ad goes live after a quick
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
        query={packagesQuery}
        pending={() =>
          [...Array(3)].map((_, i) => <Skeleton key={i} className="mb-3 h-24 rounded-lg" />)
        }
        error={() => <p className="text-center text-red-500 text-sm">Could not load packages.</p>}
        empty={() => (
          <div className="grid place-items-center gap-2 rounded-lg border border-dashed p-12 text-center text-muted-foreground text-sm">
            <PackageIcon />
            <p>No packages available yet.</p>
          </div>
        )}
        success={({ data }) => (
          <div className="flex flex-col gap-3">
            {data.map(pkg => (
              <div key={pkg.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h2 className="font-medium">{pkg.name}</h2>
                  {pkg.description && (
                    <p className="mt-1 text-muted-foreground text-sm">{pkg.description}</p>
                  )}
                  <p className="mt-2 font-medium text-sm">
                    {formatPrice(pkg.priceMonthly, pkg.currency)}/month
                  </p>
                </div>

                <Button
                  onClick={() => handleSubscribe(pkg.id)}
                  isPending={pendingPackageId === pkg.id && checkout.isPending}
                  prefix={<CheckIcon />}
                >
                  Subscribe
                </Button>
              </div>
            ))}
          </div>
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
