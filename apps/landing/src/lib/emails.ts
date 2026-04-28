import { createEmailClient } from "@openads/emails"
import { env } from "~/env"

export const emails = createEmailClient({
  apiKey: env.AUTOSEND_API_KEY,
  from: { email: env.AUTOSEND_FROM_EMAIL, name: env.AUTOSEND_FROM_NAME },
})

export const waitlistListId = env.AUTOSEND_WAITLIST_LIST_ID
