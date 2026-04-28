import { createServerFn } from "@tanstack/react-start"
import { Autosend } from "autosendjs"

export const subscribe = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => {
    const email = data.email?.trim()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please enter a valid email address")
    }

    return { email }
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.AUTOSEND_API_KEY
    const listId = process.env.AUTOSEND_WAITLIST_LIST_ID

    if (!apiKey || !listId) {
      throw new Error("Waitlist is not configured yet. Please try again later.")
    }

    const autosend = new Autosend(apiKey, { maxRetries: 3 })
    const result = await autosend.contacts.upsert({
      email: data.email,
      listIds: [listId],
    })

    if (!result.success) {
      if (import.meta.env.DEV) {
        console.error("[waitlist] AutoSend error", result.error)
      }
      throw new Error("Something went wrong. Please try again.")
    }

    return { message: "Thank you! We'll notify you when it's live." }
  })
