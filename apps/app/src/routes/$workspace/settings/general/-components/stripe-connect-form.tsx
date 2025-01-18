import type { HTMLAttributes } from "react"
import { StripeConnectButtons } from "~/components/stripe/stripe-connect-buttons"
import { Card } from "~/components/ui/card"
import { Header } from "~/components/ui/header"
import { useWorkspace } from "~/contexts/workspace-context"

export const StripeConnectForm = ({ ...props }: HTMLAttributes<HTMLElement>) => {
  const workspace = useWorkspace()

  return (
    <Card {...props}>
      <Card.Section>
        <Header
          title="Stripe Connect"
          description="Connect your Stripe account to receive payments for your ad spots."
        />

        <StripeConnectButtons workspace={workspace} className="space-y-4" />
      </Card.Section>
    </Card>
  )
}
