export interface WidgetConfig {
  workspaceId: string
  spotIds?: string[]
  theme?: "light" | "dark"
  onBook?: (spotIds: string[]) => void
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export interface BookingData {
  spotId: string
  startDate: Date
  endDate: Date
  price: number
}

declare global {
  interface Window {
    OpenAdsWidget?: {
      (action: "init", config: WidgetConfig): void
      q?: Array<[string, WidgetConfig]>
    }
  }
}
