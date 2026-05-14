import { Badge } from "@openads/ui/badge"
import { Button } from "@openads/ui/button"
import { cx } from "@openads/ui/cva"
import { Stack } from "@openads/ui/stack"
import { PlusIcon, TrashIcon } from "lucide-react"
import { type ComponentProps, useState } from "react"
import { toast } from "sonner"
import { ConfirmModal } from "~/components/modals/confirm-modal"
import { TierPriceForm } from "~/components/tiers/tier-price-form"
import { Card } from "~/components/ui/card"
import { Header, HeaderActions, HeaderTitle } from "~/components/ui/header"
import { formatInterval, formatPrice } from "~/lib/currency"
import { type RouterOutputs, trpc } from "~/lib/trpc"

type TierWithPrices = NonNullable<RouterOutputs["tier"]["getById"]>

type TierPriceListProps = ComponentProps<"div"> & {
  workspaceId: string
  tier: TierWithPrices
}

export const TierPriceList = ({ workspaceId, tier, className, ...props }: TierPriceListProps) => {
  const utils = trpc.useUtils()
  const [isAdding, setIsAdding] = useState(false)

  const archivePrice = trpc.tierPrice.archive.useMutation({
    onSuccess: async () => {
      toast.success("Price archived")
      await utils.tier.getById.invalidate({ id: tier.id, workspaceId })
    },
    onError: ({ message }) => toast.error(message),
  })

  return (
    <Card className={cx("", className)} {...props}>
      <Card.Section>
        <Header>
          <HeaderTitle size="h4">Prices</HeaderTitle>
          <HeaderActions>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              prefix={<PlusIcon />}
              onClick={() => setIsAdding(value => !value)}
            >
              {isAdding ? "Cancel" : "Add price"}
            </Button>
          </HeaderActions>
        </Header>

        {isAdding && (
          <div className="mt-4 rounded-md border p-3">
            <TierPriceForm
              workspaceId={workspaceId}
              tierId={tier.id}
              onSuccess={() => setIsAdding(false)}
            />
          </div>
        )}

        {tier.prices.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No prices on this tier yet. Add one above to start accepting subscriptions.
          </p>
        ) : (
          <div className="mt-4 flex flex-col divide-y rounded-md border">
            {tier.prices.map(price => (
              <div
                key={price.id}
                className={cx(
                  "flex items-center justify-between px-4 py-3",
                  !price.isActive && "opacity-60",
                )}
              >
                <Stack size="sm">
                  <span className="font-medium">{formatPrice(price.amount, price.currency)}</span>
                  <span className="text-muted-foreground text-sm">/ {formatInterval(price)}</span>
                  {!price.isActive && <Badge variant="secondary">Archived</Badge>}
                </Stack>

                {price.isActive && (
                  <ConfirmModal
                    isPending={archivePrice.isPending}
                    onConfirm={() => archivePrice.mutate({ id: price.id, workspaceId })}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      prefix={<TrashIcon />}
                      aria-label="Archive price"
                    >
                      Archive
                    </Button>
                  </ConfirmModal>
                )}
              </div>
            ))}
          </div>
        )}
      </Card.Section>
    </Card>
  )
}
