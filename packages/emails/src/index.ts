import { renderTemplate, type RenderResult } from "./render"
import { AdApproved, type AdApprovedProps } from "./templates/ad-approved"
import { AdChangesRequested, type AdChangesRequestedProps } from "./templates/ad-changes-requested"
import { AdPendingReview, type AdPendingReviewProps } from "./templates/ad-pending-review"
import { AdRejected, type AdRejectedProps } from "./templates/ad-rejected"
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
export type {
  AdApprovedProps,
  AdChangesRequestedProps,
  AdPendingReviewProps,
  AdRejectedProps,
  MemberInviteProps,
}

export async function renderAdPendingReview(props: AdPendingReviewProps): Promise<RenderResult> {
  return renderTemplate(AdPendingReview(props))
}

export async function renderAdApproved(props: AdApprovedProps): Promise<RenderResult> {
  return renderTemplate(AdApproved(props))
}

export async function renderAdRejected(props: AdRejectedProps): Promise<RenderResult> {
  return renderTemplate(AdRejected(props))
}

export async function renderAdChangesRequested(
  props: AdChangesRequestedProps,
): Promise<RenderResult> {
  return renderTemplate(AdChangesRequested(props))
}

export async function renderMemberInvite(props: MemberInviteProps): Promise<RenderResult> {
  return renderTemplate(MemberInvite(props))
}
