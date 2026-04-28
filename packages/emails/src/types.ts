import type { EmailAddress } from "autosendjs"

export type EmailRecipient = EmailAddress | EmailAddress[]

export interface EmailClientConfig {
  apiKey: string
  from: EmailAddress
  maxRetries?: number
}

export interface SendEmailInput {
  to: EmailRecipient
  subject: string
  html: string
  text?: string
  replyTo?: EmailAddress
  cc?: EmailRecipient
  bcc?: EmailRecipient
  from?: EmailAddress
}

export interface SendTemplateInput {
  to: EmailRecipient
  templateId: string
  subject?: string
  dynamicData?: Record<string, string | number>
  replyTo?: EmailAddress
  from?: EmailAddress
}

export interface UpsertContactInput {
  email: string
  firstName?: string
  lastName?: string
  userId?: string
  listIds?: string[]
  customFields?: Record<string, string | number | null>
}
