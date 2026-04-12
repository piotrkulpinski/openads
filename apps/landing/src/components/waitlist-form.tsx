import { useState } from "react"
import { subscribe } from "~/functions/subscribe"

export function WaitlistForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.currentTarget
    const email = new FormData(form).get("email") as string

    setStatus("loading")
    setMessage("")

    try {
      const result = await subscribe({ data: { email } })
      setStatus("success")
      setMessage(result.message)
      form.reset()
    } catch (err) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col sm:flex-row gap-2 justify-center p-2 -m-2 mb-0 bg-foreground/5 rounded-xl">
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          required
          disabled={status === "loading"}
          className="w-full flex-1 px-4 py-3 rounded-lg bg-background backdrop-blur-xl ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        <button
          type="submit"
          disabled={status === "loading"}
          className="relative inline-flex items-center justify-center gap-2 px-8 py-3 font-medium -tracking-micro bg-foreground text-background rounded-lg ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:shadow-md hover:shadow-foreground/20 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          <span className={status === "loading" ? "invisible" : ""}>Join the waitlist</span>
          {status === "loading" && (
            <span className="absolute inset-0 flex items-center justify-center">Joining...</span>
          )}
        </button>
      </div>

      {message && (
        <p
          className={`mt-2 px-2 text-sm ${status === "success" ? "text-green-500" : "text-red-500"}`}
        >
          {message}
        </p>
      )}
    </form>
  )
}
