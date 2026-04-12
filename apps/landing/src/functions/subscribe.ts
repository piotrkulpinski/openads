import { createServerFn } from "@tanstack/react-start"

export const subscribe = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => {
    const email = data.email?.trim()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please enter a valid email address")
    }

    return { email }
  })
  .handler(async ({ data }) => {
    const token = process.env.MAILERLITE_API_TOKEN

    if (!token) {
      throw new Error("Waitlist is not configured yet. Please try again later.")
    }

    const response = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      body: JSON.stringify({ email: data.email }),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Something went wrong. Please try again.")
    }

    return { message: "Thank you! We'll notify you when it's live." }
  })
