/** @jsxImportSource react */
import { Heading, Hr, Text } from "react-email"
import { Layout } from "./_layout"

export interface AdChangesRequestedProps {
  workspaceName: string
  adName: string
  changesNote: string
}

export function AdChangesRequested({
  workspaceName,
  adName,
  changesNote,
}: AdChangesRequestedProps) {
  return (
    <Layout preview={`Changes requested on your ad for ${workspaceName}`}>
      <Heading className="font-semibold text-2xl">Changes requested</Heading>

      <Text className="text-base text-neutral-700">
        Thanks for subscribing to advertise on <strong>{workspaceName}</strong>. Before{" "}
        <strong>{adName}</strong> can go live, the publisher has requested a few changes:
      </Text>

      <Text className="rounded-md border border-neutral-200 bg-neutral-50 p-4 text-base text-neutral-700">
        {changesNote}
      </Text>

      <Text className="text-base text-neutral-700">
        Reply to this email with the updated creative and the publisher will re-review.
      </Text>

      <Hr className="my-8 border-neutral-200" />

      <Text className="text-neutral-500 text-xs">
        Your subscription will continue billing — you have until your next billing period to
        resubmit.
      </Text>
    </Layout>
  )
}

export default AdChangesRequested
