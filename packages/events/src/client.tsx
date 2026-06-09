import { OpenPanelComponent } from "@openpanel/nextjs"

const isProd = process.env.NODE_ENV === "production"

export const Provider = ({ clientId }: { clientId: string }) => (
  <OpenPanelComponent
    clientId={clientId}
    trackAttributes
    trackScreenViews={isProd}
    trackOutgoingLinks={isProd}
  />
)
