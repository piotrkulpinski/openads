"use client"

import type { ComponentProps } from "react"
import { CreateWorkspaceForm } from "~/components/workspaces/create-workspace-form"
import { useOnboardingProgress } from "../../use-onboarding-progress"

export function WorkspaceForm({ ...props }: ComponentProps<typeof CreateWorkspaceForm>) {
  const { continueTo } = useOnboardingProgress()

  return (
    <CreateWorkspaceForm onSuccess={data => continueTo("spot", { slug: data?.data })} {...props} />
  )
}
