import { OpenPanel, type TrackProperties } from "@openpanel/nextjs"

type Props = {
  userId?: string
  fullName?: string | null
}

const runInBackground = (promise: Promise<unknown> | undefined) => {
  promise?.catch(error => console.error("Analytics task failed:", error))
}

export const setupAnalytics = async (options?: Props) => {
  const { userId, fullName } = options ?? {}

  const client = new OpenPanel({
    clientId: process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID ?? "",
    clientSecret: process.env.OPENPANEL_SECRET_KEY ?? "",
  })

  if (userId && fullName) {
    const [firstName, lastName] = fullName.split(" ")

    runInBackground(
      client.identify({
        profileId: userId,
        firstName,
        lastName,
      }),
    )
  }

  return {
    track: (options: { event: string } & TrackProperties) => {
      if (process.env.NODE_ENV !== "production") {
        console.log("Track", options)
        return
      }

      const { event, ...rest } = options

      runInBackground(client.track(event, rest))
    },
  }
}
