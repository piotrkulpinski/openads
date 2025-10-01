import { Button } from "@openads/ui/button"
import type { ErrorRouteComponent } from "@tanstack/react-router"
import { CircleXIcon } from "lucide-react"
import { Callout, CalloutText } from "~/components/ui/callout"
import { Header, HeaderDescription, HeaderTitle } from "~/components/ui/header"
import { env } from "~/env"

export const ErrorRoute: ErrorRouteComponent = ({ error, reset }) => {
  return (
    <>
      <Header>
        <HeaderTitle>Something went wrong</HeaderTitle>

        <HeaderDescription size="md">
          <p className="max-w-lg">
            We're sorry, but we couldn't load this page. Please <a href="#">reach out to support</a>{" "}
            if this error persists.
          </p>
        </HeaderDescription>

        <Button size="lg" className="my-2" onClick={reset}>
          Try again
        </Button>
      </Header>

      {env.MODE === "development" && error.message && (
        <Callout variant="danger" prefix={<CircleXIcon />}>
          <CalloutText>
            <strong>{error.name}:</strong> {error.message}
          </CalloutText>
        </Callout>
      )}
    </>
  )
}
