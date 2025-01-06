import { H3 } from "~/components/heading"
import { WorkspaceForm } from "./form"

export default function Workspace() {
  return (
    <>
      <H3 as="h1">Create your workspace</H3>

      <p className="mt-2 text-muted-foreground">
        For example, you can use the name of your company or department.
      </p>

      <WorkspaceForm className="w-full mt-10" />
    </>
  )
}
