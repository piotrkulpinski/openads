import { OpenPanelComponent, type TrackProperties, useOpenPanel } from "@openpanel/nextjs"
import type { ReactElement } from "react"

const isProd = process.env.NODE_ENV === "production"

const Provider = ({ clientId }: { clientId: string }): ReactElement => (
  <OpenPanelComponent
    clientId={clientId}
    trackAttributes={true}
    trackScreenViews={isProd}
    trackOutgoingLinks={isProd}
  />
)

const track = (options: { event: string } & TrackProperties) => {
  const { track: openTrack } = useOpenPanel()

  if (!isProd) {
    console.log("Track", options)
    return
  }

  const { event, ...rest } = options

  openTrack(event, rest)
}

export { Provider, track }
