import type { RouterOutputs } from "@openads/trpc/router"
import { Button } from "@openads/ui/button"
import { Calendar } from "@openads/ui/calendar"
import { cx } from "@openads/ui/cva"
import { Tooltip } from "@openads/ui/tooltip"
import { differenceInDays, endOfDay, startOfDay } from "date-fns"
import { EyeIcon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { useCallback, useMemo } from "react"
import type { DateRange } from "react-day-picker"
import { Price } from "~/components/price"
import { H4 } from "~/components/ui/heading"
import { Stack } from "~/components/ui/stack"
import { useBooking } from "~/contexts/booking-context"
import { getFirstAvailableBookingMonth } from "~/lib/bookings"
import { trpc } from "~/lib/trpc"

type EmbedBookingCalendarProps = HTMLAttributes<HTMLDivElement> & {
  spot: RouterOutputs["spot"]["getAll"][number]
}

export const EmbedBookingCalendar = ({ className, spot, ...props }: EmbedBookingCalendarProps) => {
  const { price, selections, clearSelection, updateSelection } = useBooking()
  const selection = selections.find(s => s.spotId === spot.id)

  const { data: bookings } = trpc.booking.public.getAllBySpotId.useQuery(
    { spotId: spot.id },
    { initialData: [] },
  )

  const booked = useMemo(
    () =>
      bookings
        .filter(({ spotId }) => spotId === spot.id)
        .map(({ startsAt, endsAt }) => ({
          from: startOfDay(startsAt),
          to: startOfDay(endsAt),
        })),
    [bookings, spot.id],
  )

  const firstAvailableMonth = useMemo(() => getFirstAvailableBookingMonth(booked), [booked])

  const calculateDuration = useCallback(
    (range: DateRange) => {
      if (!range.from || !range.to) return undefined

      const from = startOfDay(range.from)
      const to = endOfDay(range.to)

      const duration = differenceInDays(to, from) + 1
      const overlapDays = booked.reduce((acc, { from: bookedFrom, to: bookedTo }) => {
        const normalizedBookedFrom = startOfDay(bookedFrom)
        const normalizedBookedTo = endOfDay(bookedTo)

        if (normalizedBookedTo < from || normalizedBookedFrom > to) return acc

        const overlapStart = from > normalizedBookedFrom ? from : normalizedBookedFrom
        const overlapEnd = to < normalizedBookedTo ? to : normalizedBookedTo
        const overlap = differenceInDays(overlapEnd, overlapStart) + 1

        return acc + overlap
      }, 0)

      return Math.max(duration - overlapDays, 0)
    },
    [booked],
  )

  const handleSelect = useCallback((dateRange?: DateRange) => {
    if (!dateRange?.from || !dateRange?.to) {
      clearSelection(spot.id)
      return
    }

    updateSelection({
      spotId: spot.id,
      dateRange,
      duration: calculateDuration(dateRange),
    })
  }, [])

  const discountedPrice = price?.discountPercentage
    ? spot.price * (1 - price.discountPercentage / 100)
    : spot.price

  return (
    <div className={cx("flex flex-col w-full divide-y", className)} {...props}>
      <Stack size="sm" direction="column" className="items-stretch py-2 px-4">
        <Stack>
          <H4 as="h3">{spot.name}</H4>

          {price && <Price price={discountedPrice} interval="day" className="ml-auto text-sm" />}
        </Stack>

        <Stack size="sm">
          {spot.previewUrl && (
            <Tooltip tooltip="Preview this ad">
              <Button variant="outline" size="sm" prefix={<EyeIcon />} isAffixOnly asChild>
                <a href={spot.previewUrl} target="_blank" rel="noopener noreferrer nofollow" />
              </Button>
            </Tooltip>
          )}

          <p className="flex-1 text-muted-foreground text-sm text-pretty">{spot.description}</p>
        </Stack>
      </Stack>

      <Calendar
        mode="range"
        selected={selection?.dateRange}
        onSelect={handleSelect}
        defaultMonth={firstAvailableMonth}
        startMonth={booked[0]?.from ?? firstAvailableMonth} // TODO: Make sure it's correct
        disabled={[date => date < new Date(), ...booked]}
        modifiers={{ booked }}
        modifiersClassNames={{ booked: "*:line-through" }}
        className="w-full p-4"
      />
    </div>
  )
}
