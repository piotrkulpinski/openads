/** @jsxImportSource react */
import { Button, Heading, Hr, Section, Text } from "react-email"
import { Layout } from "./_layout"

export interface AdChangesRequestedProps {
  workspaceName: string
  adName: string
  zoneName: string
  changesNote: string
  resubmitUrl: string
}

export function AdChangesRequested({
  workspaceName,
  adName,
  zoneName,
  changesNote,
  resubmitUrl,
}: AdChangesRequestedProps) {
  return (
    <Layout preview={`Changes requested on your ad for ${workspaceName}`}>
      <Heading className="font-semibold text-2xl">Changes requested</Heading>

      <Text className="text-base text-neutral-700">
        Thanks for subscribing to advertise on the <strong>{zoneName}</strong> zone of{" "}
        <strong>{workspaceName}</strong>. Before <strong>{adName}</strong> can go live, the
        publisher has requested a few changes:
      </Text>

      <Text className="rounded-md border border-neutral-200 bg-neutral-50 p-4 text-base text-neutral-700">
        {changesNote}
      </Text>

      <Section className="my-8 text-center">
        <Button
          href={resubmitUrl}
          className="rounded-md bg-neutral-900 px-5 py-3 font-medium text-sm text-white"
        >
          Update your ad
        </Button>
      </Section>

      <Hr className="my-8 border-neutral-200" />

      <Text className="text-neutral-500 text-xs">
        Your subscription will continue billing — you have until your next billing period to
        resubmit.
      </Text>
    </Layout>
  )
}

export default AdChangesRequested
