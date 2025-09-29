import type { ComponentProps, HTMLAttributes } from "react"
import { StripeConnectButtons } from "~/components/stripe/stripe-connect-buttons"
import { Card } from "~/components/ui/card"
import { Header } from "~/components/ui/header"
import { useWorkspace } from "~/contexts/workspace-context"

export const StripeConnectForm = ({ ...props }: ComponentProps<"div">) => {
  const workspace = useWorkspace()

  return (
    <Card {...props}>
      <Card.Section>
        <Header
          size="h4"
          title="Stripe Connect"
          description="Connect your Stripe account to receive payments for your ad zones."
        />

        <StripeConnectButtons workspace={workspace} className="space-y-4" />
      </Card.Section>
    </Card>
  )
}
