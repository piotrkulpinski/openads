import { createContext, use, useCallback, useMemo, useState } from "react"
import type { PropsWithChildren } from "react"
import type { DateRange } from "react-day-picker"
import { calculateBookingPrice } from "~/lib/bookings"
import type { RouterOutputs } from "~/lib/trpc"

// export type BookingPicker = {
//   label: string
//   type: BookingType
//   description: string
//   price: number
// }

export type BookingSelection = {
  spotId: string
  dateRange: DateRange
  duration?: number
}

type BookingContext = {
  spots: RouterOutputs["spot"]["getAll"]
  price: ReturnType<typeof calculateBookingPrice> | null
  selections: BookingSelection[]
  findBookingSpot: (spotId: string) => RouterOutputs["spot"]["getAll"][number]
  clearSelection: (spotId: string) => void
  updateSelection: (selection: BookingSelection) => void
}

const BookingContext = createContext<BookingContext>(null!)

type BookingProviderProps = PropsWithChildren<{
  spots: RouterOutputs["spot"]["getAll"]
}>

export const BookingProvider = ({ spots, ...props }: BookingProviderProps) => {
  const [selections, setSelections] = useState<BookingSelection[]>([])

  const findBookingSpot = useCallback((spotId: string) => {
    return spots.find(s => s.id === spotId)!
  }, [])

  // Clear selection
  const clearSelection = useCallback((spotId: string) => {
    setSelections(prev => prev.filter(s => s.spotId !== spotId))
  }, [])

  // Update selection
  const updateSelection = useCallback(({ spotId, ...selection }: BookingSelection) => {
    setSelections(prev => {
      if (prev.findIndex(s => s.spotId === spotId) === -1) {
        return [...prev, { spotId, ...selection }]
      }

      return prev.map(s => (s.spotId === spotId ? { ...s, ...selection } : s))
    })
  }, [])

  const price = useMemo(() => {
    // TODO: Fix this
    const selectedItems = selections
      .filter(s => s.duration && s.duration > 0)
      .map(selection => ({
        price: findBookingSpot(selection.spotId).price,
        duration: selection.duration,
      }))

    if (selectedItems.length === 0) return null

    const basePrice = Math.min(...spots.map(s => s.price))
    return calculateBookingPrice(selectedItems, basePrice)
  }, [selections, spots])

  return (
    <BookingContext.Provider
      value={{
        spots,
        price,
        selections,
        findBookingSpot,
        clearSelection,
        updateSelection,
      }}
      {...props}
    />
  )
}

export const useBooking = () => use(BookingContext)
