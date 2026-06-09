import type { EmailAddress } from "autosendjs"

export type EmailRecipient = EmailAddress | EmailAddress[]

export type EmailClientConfig = {
  apiKey: string
  from: EmailAddress
  maxRetries?: number
}

export type SendEmailInput = {
  to: EmailRecipient
  subject: string
  html: string
  text?: string
  replyTo?: EmailAddress
  cc?: EmailRecipient
  bcc?: EmailRecipient
  from?: EmailAddress
}

export type UpsertContactInput = {
  email: string
  firstName?: string
  lastName?: string
  userId?: string
  listIds?: string[]
  customFields?: Record<string, string | number | null>
}
