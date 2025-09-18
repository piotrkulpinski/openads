import { Button } from "@openads/ui/button"
import { Link } from "@tanstack/react-router"
import { Intro, IntroDescription, IntroTitle } from "~/components/ui/intro"

export const NotFound = () => {
  return (
    <Intro className="mx-auto w-full lg:max-w-3xl">
      <IntroTitle>404 Not Found</IntroTitle>

      <IntroDescription className="max-w-md">
        We're sorry, but the page could not be found. You may have mistyped the address or the page
        may have moved.
      </IntroDescription>

      <Button size="lg" className="mt-4" asChild>
        <Link to="/">Go back home</Link>
      </Button>
    </Intro>
  )
}
