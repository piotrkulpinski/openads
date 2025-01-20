import { useEffect, useState } from "react"
import { toast } from "sonner"
import { trpc } from "../lib/trpc"
import type { BookingData, WidgetConfig } from "../types"

export const Widget = ({
  workspaceId,
  spotIds,
  theme = "light",
  onBook,
  onSuccess,
  onError,
}: WidgetConfig) => {
  const [spots, setSpots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSpots, setSelectedSpots] = useState<BookingData[]>([])

  useEffect(() => {
    const loadSpots = async () => {
      try {
        const data = await trpc.spot.getAll.query({ workspaceId })
        setSpots(spotIds ? data.filter(spot => spotIds.includes(spot.id)) : data)
      } catch (error) {
        onError?.(error as Error)
        toast.error("Failed to load ad spots")
      } finally {
        setLoading(false)
      }
    }

    loadSpots()
  }, [workspaceId, spotIds, onError])

  const handleBook = async () => {
    try {
      onBook?.(selectedSpots.map(s => s.spotId))
      onSuccess?.()
      toast.success("Booking successful")
      setSelectedSpots([])
    } catch (error) {
      onError?.(error as Error)
      toast.error("Failed to create booking")
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className={`openads-widget theme-${theme}`}>
      <div className="p-4 border rounded-lg">
        <h2 className="text-lg font-semibold">Ad Spots</h2>
        <p className="text-sm text-gray-500">Workspace ID: {workspaceId}</p>
        {spotIds && <p className="text-sm text-gray-500">Spot IDs: {spotIds.join(", ")}</p>}
      </div>
    </div>
  )
}
