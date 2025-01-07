"use client"

import { Button } from "@openads/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Intro, IntroDescription, IntroTitle } from "~/components/intro"

export default function NotFound() {
  const pathname = usePathname()

  return (
    <Intro>
      <IntroTitle>404 Not Found</IntroTitle>

      <IntroDescription className="max-w-xl">
        We're sorry, but the page {pathname} could not be found. You may have mistyped the address
        or the page may have moved.
      </IntroDescription>

      <Button size="lg" className="mt-4" asChild>
        <Link href="/">Go back home</Link>
      </Button>
    </Intro>
  )
}
