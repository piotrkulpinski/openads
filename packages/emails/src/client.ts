import { Autosend } from "autosendjs"
import type {
  EmailClientConfig,
  SendEmailInput,
  SendTemplateInput,
  UpsertContactInput,
} from "./types"

export function createEmailClient(config: EmailClientConfig) {
  const autosend = new Autosend(config.apiKey, {
    maxRetries: config.maxRetries ?? 3,
  })

  async function send(input: SendEmailInput) {
    return autosend.emails.send({
      from: input.from ?? config.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
      cc: input.cc,
      bcc: input.bcc,
    })
  }

  async function sendTemplate(input: SendTemplateInput) {
    return autosend.emails.send({
      from: input.from ?? config.from,
      to: input.to,
      subject: input.subject ?? "",
      templateId: input.templateId,
      dynamicData: input.dynamicData,
      replyTo: input.replyTo,
    })
  }

  async function upsertContact(input: UpsertContactInput) {
    return autosend.contacts.upsert(input)
  }

  return {
    autosend,
    send,
    sendTemplate,
    upsertContact,
  }
}

export type EmailClient = ReturnType<typeof createEmailClient>
