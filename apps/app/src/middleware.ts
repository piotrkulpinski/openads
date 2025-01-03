import { type NextRequest, NextResponse } from "next/server"
import type { auth } from "~/lib/auth/server"

type Session = typeof auth.$Infer.Session

export async function middleware({ url, nextUrl, headers }: NextRequest) {
  const sessionResponse = await fetch(`${nextUrl.origin}/api/auth/get-session`, {
    headers: { cookie: headers.get("cookie") || "" },
  })

  const session = (await sessionResponse.json()) as Session | null

  if (!session && nextUrl.pathname !== "/login") {
    const encodedSearchParams = `${nextUrl.pathname.substring(1)}${nextUrl.search}`

    const loginUrl = new URL("/login", url)

    if (encodedSearchParams) {
      loginUrl.searchParams.append("return_to", encodedSearchParams)
    }

    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
}
