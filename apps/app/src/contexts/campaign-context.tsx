import type { PropsWithChildren } from "react"
import { createContext, use, useCallback, useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"
import { calculateCampaignPrice } from "~/lib/campaigns"
import type { RouterOutputs } from "~/lib/trpc"

// export type CampaignPicker = {
//   label: string
//   type: CampaignType
//   description: string
//   price: number
// }

export type CampaignSelection = {
  zoneId: string
  dateRange: DateRange
  duration?: number
}

type CampaignContext = {
  zones: RouterOutputs["zone"]["getAll"]
  price: ReturnType<typeof calculateCampaignPrice> | null
  selections: CampaignSelection[]
  findCampaignZone: (zoneId: string) => RouterOutputs["zone"]["getAll"][number]
  clearSelection: (zoneId: string) => void
  updateSelection: (selection: CampaignSelection) => void
}

const CampaignContext = createContext<CampaignContext>(null!)

type CampaignProviderProps = PropsWithChildren<{
  zones: RouterOutputs["zone"]["getAll"]
}>

export const CampaignProvider = ({ zones, ...props }: CampaignProviderProps) => {
  const [selections, setSelections] = useState<CampaignSelection[]>([])

  const findCampaignZone = useCallback((zoneId: string) => {
    return zones.find(s => s.id === zoneId)!
  }, [])

  // Clear selection
  const clearSelection = useCallback((zoneId: string) => {
    setSelections(prev => prev.filter(s => s.zoneId !== zoneId))
  }, [])

  // Update selection
  const updateSelection = useCallback(({ zoneId, ...selection }: CampaignSelection) => {
    setSelections(prev => {
      if (prev.findIndex(s => s.zoneId === zoneId) === -1) {
        return [...prev, { zoneId, ...selection }]
      }

      return prev.map(s => (s.zoneId === zoneId ? { ...s, ...selection } : s))
    })
  }, [])

  const price = useMemo(() => {
    // TODO: Fix this
    const selectedItems = selections
      .filter(s => s.duration && s.duration > 0)
      .map(selection => ({
        price: findCampaignZone(selection.zoneId).price,
        duration: selection.duration,
      }))

    if (selectedItems.length === 0) return null

    const basePrice = Math.min(...zones.map(s => s.price))
    return calculateCampaignPrice(selectedItems, basePrice)
  }, [selections, zones])

  return (
    <CampaignContext.Provider
      value={{
        zones,
        price,
        selections,
        findCampaignZone,
        clearSelection,
        updateSelection,
      }}
      {...props}
    />
  )
}

export const useCampaign = () => use(CampaignContext)
