import { type NextRequest, NextResponse } from "next/server"
import type { auth } from "~/lib/auth/server"

type Session = typeof auth.$Infer.Session

export async function middleware({ url, nextUrl, headers }: NextRequest) {
  const sessionResponse = await fetch(`${nextUrl.origin}/api/auth/get-session`, {
    headers: { cookie: headers.get("cookie") || "" },
  })

  const session = (await sessionResponse.json()) as Session | null

  // If the user is not authenticated, redirect to the login page
  if (!session) {
    if (nextUrl.pathname !== "/login") {
      const loginUrl = new URL("/login", url)
      loginUrl.searchParams.append("callbackURL", nextUrl.href)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
}
