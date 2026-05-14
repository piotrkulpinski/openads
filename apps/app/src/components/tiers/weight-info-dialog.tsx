import { Button } from "@openads/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@openads/ui/dialog"
import { Stack } from "@openads/ui/stack"
import { InfoIcon } from "lucide-react"

// Three example tiers, chosen so the percentages land near the simple "this is what
// weight does" intuition (Premium ~2x Standard, Promo ~half).
const exampleTiers = [
  { name: "Promotional", weight: 0.5 },
  { name: "Standard", weight: 1.0 },
  { name: "Premium", weight: 2.0 },
] as const

const totalWeight = exampleTiers.reduce((sum, t) => sum + t.weight, 0)

export const WeightInfoDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          prefix={<InfoIcon />}
          className="ml-auto h-auto px-1.5 py-0.5 text-muted-foreground text-xs hover:text-foreground"
        >
          How it works
        </Button>
      </DialogTrigger>

      <DialogContent size="lg" className="gap-0 p-0">
        <DialogHeader className="space-y-2 border-b px-6 py-5">
          <DialogTitle className="font-semibold text-xl">How weight works</DialogTitle>
          <DialogDescription className="text-sm">
            Weight is the frequency dial for a tier — higher numbers mean more impressions in
            rotation. Set it once, then let the algorithm do the math.
          </DialogDescription>
        </DialogHeader>

        <Stack direction="column" size="lg" className="px-6 py-6">
          <section>
            <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Share of impressions
            </h3>

            <div className="mt-4 grid grid-cols-[1fr_minmax(0,2fr)_auto] items-center gap-x-4 gap-y-3">
              {exampleTiers.map(tier => {
                const share = tier.weight / totalWeight
                const widthPct = `${(share * 100).toFixed(1)}%`
                const sharePct = `${Math.round(share * 100)}%`

                return (
                  <Stack key={tier.name} direction="row" size="sm" className="contents text-sm">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium">{tier.name}</span>
                      <span className="font-mono text-muted-foreground text-xs tabular-nums">
                        {tier.weight.toFixed(1)}×
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                      <div
                        className="h-full rounded-full bg-foreground"
                        style={{ width: widthPct }}
                      />
                    </div>

                    <span className="font-mono text-muted-foreground text-xs tabular-nums">
                      {sharePct}
                    </span>
                  </Stack>
                )
              })}
            </div>

            <p className="mt-4 rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs leading-relaxed">
              share = tier_weight ÷ sum(active_weights)
            </p>
            <p className="mt-2 text-muted-foreground text-sm">
              A tier's share is its weight divided by the total of all active tier weights. Three
              tiers at 0.5×, 1.0×, and 2.0× total 3.5 — so they split as 14% / 29% / 57%.
            </p>
          </section>

          <section className="border-t pt-5">
            <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Fairness boost
            </h3>
            <p className="mt-3 text-sm">
              Every 24 hours, ads that have been served the least get a small effective-weight bump
              — up to <span className="font-mono tabular-nums">+20%</span> — so a low-weight tier
              doesn't starve. Weights set the long-run trend; fairness smooths the short term.
            </p>
          </section>

          <section className="border-t pt-5">
            <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Quick guide
            </h3>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="font-mono text-muted-foreground tabular-nums">0.5×</dt>
              <dd>Promotional or discount tier</dd>
              <dt className="font-mono text-muted-foreground tabular-nums">1.0×</dt>
              <dd>Standard parity (default)</dd>
              <dt className="font-mono text-muted-foreground tabular-nums">2.0×</dt>
              <dd>Premium placement</dd>
              <dt className="font-mono text-muted-foreground tabular-nums">3.0+×</dt>
              <dd>Rare or exclusive showcase</dd>
            </dl>
          </section>
        </Stack>

        <DialogFooter className="border-t px-6 py-4">
          <DialogClose>Got it</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
