import { createServerFn } from "@tanstack/react-start"
import { emails, waitlistListId } from "~/lib/emails"

export const subscribe = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => {
    const email = data.email?.trim()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please enter a valid email address")
    }

    return { email }
  })
  .handler(async ({ data }) => {
    const result = await emails.upsertContact({
      email: data.email,
      listIds: [waitlistListId],
    })

    if (!result.success) {
      if (import.meta.env.DEV) {
        console.error("[waitlist] AutoSend error", result.error)
      }
      throw new Error("Something went wrong. Please try again.")
    }

    return { message: "Thank you! We'll notify you when it's live." }
  })
