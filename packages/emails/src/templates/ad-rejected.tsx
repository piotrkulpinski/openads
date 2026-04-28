/** @jsxImportSource react */
import { Heading, Hr, Text } from "react-email"
import { Layout } from "./_layout"

export interface AdRejectedProps {
  workspaceName: string
  adName: string
  zoneName: string
  rejectionNote?: string
}

export function AdRejected({ workspaceName, adName, zoneName, rejectionNote }: AdRejectedProps) {
  return (
    <Layout preview={`Your ad on ${workspaceName} was not approved`}>
      <Heading className="font-semibold text-2xl">Your ad was not approved</Heading>

      <Text className="text-base text-neutral-700">
        Unfortunately, <strong>{adName}</strong> was not approved for the{" "}
        <strong>{zoneName}</strong> zone on <strong>{workspaceName}</strong>.
      </Text>

      {rejectionNote ? (
        <Text className="rounded-md border border-neutral-200 bg-neutral-50 p-4 text-base text-neutral-700">
          {rejectionNote}
        </Text>
      ) : null}

      <Text className="text-base text-neutral-700">
        Your subscription has been canceled and you will not be charged again. If you'd like to
        revise and resubmit, reply to this email.
      </Text>

      <Hr className="my-8 border-neutral-200" />

      <Text className="text-neutral-500 text-xs">
        Sent automatically by OpenAds on behalf of {workspaceName}.
      </Text>
    </Layout>
  )
}

export default AdRejected
