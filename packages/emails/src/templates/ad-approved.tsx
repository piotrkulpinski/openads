/** @jsxImportSource react */
import { Heading, Hr, Text } from "react-email"
import { Layout } from "./_layout"

export interface AdApprovedProps {
  workspaceName: string
  adName: string
  zoneName: string
}

export function AdApproved({ workspaceName, adName, zoneName }: AdApprovedProps) {
  return (
    <Layout preview={`Your ad on ${workspaceName} is now live`}>
      <Heading className="font-semibold text-2xl">Your ad is live</Heading>

      <Text className="text-base text-neutral-700">
        <strong>{adName}</strong> just went live in the <strong>{zoneName}</strong> zone on{" "}
        <strong>{workspaceName}</strong>. Thanks for advertising with us — your subscription will
        renew monthly until you cancel from your Stripe billing portal.
      </Text>

      <Hr className="my-8 border-neutral-200" />

      <Text className="text-neutral-500 text-xs">
        Need to update your creative or cancel? Reply to this email and we'll point you in the right
        direction.
      </Text>
    </Layout>
  )
}

export default AdApproved
