import { db } from "@openads/db"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "~/lib/auth/server"

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/login")
  }

  // check if user has a workspace, if not, redirect to the onboarding page
  const workspaces = await db.workspace.findMany({
    where: { users: { some: { userId: session.user.id } } },
  })

  if (workspaces.length === 0) {
    redirect("/onboarding")
  }

  redirect(`/${workspaces[0]?.slug}`)
}
