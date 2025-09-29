import { Badge } from "@openads/ui/badge"
import { Button } from "@openads/ui/button"
import { cx } from "@openads/ui/cva"
import { Stack } from "@openads/ui/stack"
import { Tooltip } from "@openads/ui/tooltip"
import { formatDateRange } from "@primoui/utils"
import { endOfDay, startOfDay } from "date-fns"
import { XIcon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { EmbedCampaignCalendar } from "~/components/embed/embed-campaign-calendar"
import { Price } from "~/components/price"
import { useCampaign } from "~/contexts/campaign-context"

export const EmbedCampaign = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  const { zones, price, selections, findCampaignZone, clearSelection } = useCampaign()
  const isPending = false

  // const { mutate, isPending } = trpc.stripe.checkout.create.useMutation({
  //   onSuccess: ({ data }) => {
  //     posthog.capture("stripe_checkout_ad", { ...price })

  //     window.open(data, "_blank")?.focus()
  //   },

  //   onError: ({ err }) => {
  //     toast.error(err.message)
  //   },
  // })

  // const handleCheckout = () => {
  //   const checkoutData = selections.map(selection => {
  //     const zone = findCampaignZone(selection.zoneId)

  //     const discountedPrice = price?.discountPercentage
  //       ? zone.price * (1 - price.discountPercentage / 100)
  //       : zone.price

  //     return {
  //       zoneId: selection.zoneId,
  //       price: discountedPrice,
  //       duration: selection.duration ?? 0,
  //       metadata: {
  //         startDate: selection.dateRange?.from?.getTime() ?? 0,
  //         endDate: selection.dateRange?.to?.getTime() ?? 0,
  //       },
  //     }
  //   })

  //   // mutate(checkoutData)
  //   console.log(checkoutData)
  // }

  return (
    <div className={cx("flex flex-col w-full border divide-y rounded-md", className)} {...props}>
      <div className="flex flex-col w-full sm:flex-row sm:divide-x max-sm:divide-y">
        {zones.map(zone => (
          <EmbedCampaignCalendar key={zone.id} zone={zone} />
        ))}
      </div>

      {!!selections.length && (
        <div className="flex flex-col gap-3 text-sm text-muted-foreground p-4">
          {selections.map(selection => {
            if (!selection.dateRange?.from || !selection.dateRange?.to || !selection.duration) {
              return null
            }

            const zone = findCampaignZone(selection.zoneId)
            const from = startOfDay(selection.dateRange.from)
            const to = endOfDay(selection.dateRange.to)

            return (
              <div key={selection.zoneId} className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="flex items-center gap-2 mr-auto">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="p-0.5"
                    aria-label={`Clear ${zone.name} selection`}
                    prefix={<XIcon />}
                    onClick={() => clearSelection(selection.zoneId)}
                  />

                  <div>
                    <strong className="font-medium text-foreground">{zone.name}</strong> – (
                    {selection.duration} {selection.duration === 1 ? "day" : "days"})
                  </div>
                </span>

                <span>{formatDateRange(from, to)}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground text-center p-4 sm:justify-between sm:text-start">
        {price ? (
          <>
            <Stack size="sm" className="mr-auto">
              Total:
              <Price
                price={price.discountedPrice}
                fullPrice={price.totalPrice}
                priceClassName="text-foreground text-base"
              />
            </Stack>

            {price.discountPercentage > 0 && (
              <Tooltip tooltip="Discount applied based on the order value. Max 30% off.">
                <Badge
                  variant="secondary"
                  className="-my-1 text-green-700/90 dark:text-green-300/90"
                >
                  {price.discountPercentage}% off
                </Badge>
              </Tooltip>
            )}
          </>
        ) : (
          <p>Please select dates for at least one ad zone.</p>
        )}

        <Button
          size="lg"
          disabled={!selections.length || isPending}
          isPending={isPending}
          className="max-sm:w-full sm:-my-2"
          // onClick={handleCheckout}
        >
          Purchase Now
        </Button>
      </div>
    </div>
  )
}
