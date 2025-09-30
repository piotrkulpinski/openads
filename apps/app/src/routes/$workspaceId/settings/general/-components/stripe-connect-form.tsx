import type { ComponentProps } from "react"
import { StripeConnectButtons } from "~/components/stripe/stripe-connect-buttons"
import { Card } from "~/components/ui/card"
import { Header, HeaderDescription, HeaderTitle } from "~/components/ui/header"
import { useWorkspace } from "~/contexts/workspace-context"

export const StripeConnectForm = ({ ...props }: ComponentProps<"div">) => {
  const workspace = useWorkspace()

  return (
    <Card {...props}>
      <Card.Section>
        <Header>
          <HeaderTitle size="h4">Stripe Connect</HeaderTitle>

          <HeaderDescription>
            Connect your Stripe account to receive payments for your ad zones.
          </HeaderDescription>
        </Header>

        <StripeConnectButtons workspace={workspace} className="space-y-4" />
      </Card.Section>
    </Card>
  )
}
