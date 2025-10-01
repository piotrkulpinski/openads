import { Button } from "@openads/ui/button"
import { Link, type NotFoundRouteComponent } from "@tanstack/react-router"
import { Header, HeaderDescription, HeaderTitle } from "~/components/ui/header"

export const NotFoundRoute: NotFoundRouteComponent = () => {
  return (
    <Header>
      <HeaderTitle>404 Not Found</HeaderTitle>

      <HeaderDescription size="md" className="max-w-lg">
        We're sorry, but the page could not be found. You may have mistyped the address or the page
        may have moved.
      </HeaderDescription>

      <Button size="lg" className="mt-2" asChild>
        <Link to="/">Go back home</Link>
      </Button>
    </Header>
  )
}
