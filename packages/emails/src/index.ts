import { renderTemplate, type RenderResult } from "./render"
import { AdPendingReview, type AdPendingReviewProps } from "./templates/ad-pending-review"
import { MemberInvite, type MemberInviteProps } from "./templates/member-invite"

export { createEmailClient, type EmailClient } from "./client"
export { renderTemplate, type RenderResult } from "./render"
export type {
  EmailClientConfig,
  EmailRecipient,
  SendEmailInput,
  SendTemplateInput,
  UpsertContactInput,
} from "./types"
export type { AdPendingReviewProps, MemberInviteProps }

export async function renderAdPendingReview(props: AdPendingReviewProps): Promise<RenderResult> {
  return renderTemplate(AdPendingReview(props))
}

export async function renderMemberInvite(props: MemberInviteProps): Promise<RenderResult> {
  return renderTemplate(MemberInvite(props))
}
