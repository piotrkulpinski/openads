import { Button, Heading, Hr, Link, Section, Text } from "react-email"
import { Layout } from "./_layout"

export interface MemberInviteProps {
  workspaceName: string
  inviteUrl: string
  inviterName?: string
}

export function MemberInvite({ workspaceName, inviteUrl, inviterName }: MemberInviteProps) {
  const previewText = inviterName
    ? `${inviterName} invited you to join ${workspaceName} on OpenAds`
    : `You have been invited to join ${workspaceName} on OpenAds`

  return (
    <Layout preview={previewText}>
      <Heading className="text-2xl font-semibold">You are invited to {workspaceName}</Heading>

      <Text className="text-base text-neutral-700">
        {inviterName ? <>{inviterName} has invited you</> : <>You have been invited</>} to
        collaborate on <strong>{workspaceName}</strong> in OpenAds.
      </Text>

      <Section className="my-8 text-center">
        <Button
          href={inviteUrl}
          className="rounded-md bg-neutral-900 px-5 py-3 text-sm font-medium text-white"
        >
          Accept invitation
        </Button>
      </Section>

      <Text className="text-sm text-neutral-600">
        Or copy and paste this link into your browser:
        <br />
        <Link href={inviteUrl} className="text-neutral-900 underline">
          {inviteUrl}
        </Link>
      </Text>

      <Hr className="my-8 border-neutral-200" />

      <Text className="text-xs text-neutral-500">
        If you were not expecting this invitation, you can safely ignore this email.
      </Text>
    </Layout>
  )
}

export default MemberInvite
