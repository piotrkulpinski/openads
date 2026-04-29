/** @jsxImportSource react */
import { Button, Heading, Hr, Section, Text } from "react-email"
import { Layout } from "./_layout"

export interface AdPendingReviewProps {
  workspaceName: string
  advertiserName: string
  advertiserEmail: string
  zoneName: string
  packageName: string
  reviewUrl: string
}

export function AdPendingReview({
  workspaceName,
  advertiserName,
  advertiserEmail,
  zoneName,
  packageName,
  reviewUrl,
}: AdPendingReviewProps) {
  return (
    <Layout preview={`A new ad is awaiting review on ${workspaceName}`}>
      <Heading className="font-semibold text-2xl">New ad pending review</Heading>

      <Text className="text-base text-neutral-700">
        <strong>{advertiserName}</strong> ({advertiserEmail}) just subscribed to the{" "}
        <strong>{packageName}</strong> package on the <strong>{zoneName}</strong> zone of{" "}
        <strong>{workspaceName}</strong>.
      </Text>

      <Text className="text-base text-neutral-700">
        The ad is currently <strong>pending</strong> and won't serve until you approve it.
      </Text>

      <Section className="my-8 text-center">
        <Button
          href={reviewUrl}
          className="rounded-md bg-neutral-900 px-5 py-3 font-medium text-sm text-white"
        >
          Review the ad
        </Button>
      </Section>

      <Hr className="my-8 border-neutral-200" />

      <Text className="text-neutral-500 text-xs">
        You're receiving this because you're an Owner or Manager on this workspace.
      </Text>
    </Layout>
  )
}

export default AdPendingReview
