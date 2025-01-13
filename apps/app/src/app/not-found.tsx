import { Button } from "@openads/ui/button"
import { Link, useLocation } from "react-router"
import { Intro, IntroDescription, IntroTitle } from "~/components/intro"

export default function NotFound() {
  const { pathname } = useLocation()

  return (
    <Intro alignment="center">
      <IntroTitle>404 Not Found</IntroTitle>

      <IntroDescription className="max-w-md">
        We're sorry, but the page `{pathname}` could not be found. You may have mistyped the address
        or the page may have moved.
      </IntroDescription>

      <Button size="lg" className="mt-4" asChild>
        <Link to="/">Go back home</Link>
      </Button>
    </Intro>
  )
}
