import { createFileRoute } from "@tanstack/react-router"
import { H3 } from "~/components/heading"

export const Route = createFileRoute("/$workspace/")({
  component: () => <H3>Dashboard</H3>,
})
