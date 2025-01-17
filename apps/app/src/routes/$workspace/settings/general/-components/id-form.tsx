import { Input } from "@openads/ui/input"
import type { HTMLAttributes } from "react"
import { Card } from "~/components/ui/card"
import { Header } from "~/components/ui/header"
import { Prose } from "~/components/ui/prose"
import { siteConfig } from "~/config/site"
import { useWorkspace } from "~/contexts/workspace-context"

export const IdForm = ({ ...props }: HTMLAttributes<HTMLElement>) => {
  const workspace = useWorkspace()

  return (
    <Card {...props}>
      <Card.Section>
        <Header
          title="Workspace ID"
          description={`Unique ID of your workspace on ${siteConfig.name}.`}
        />

        <Input readOnly className="max-w-xl" value={workspace.id} />
      </Card.Section>

      <Card.Row>
        <Prose>
          Used to identify your workspace when interacting with the {siteConfig.name} API.
        </Prose>
      </Card.Row>
    </Card>
  )
}
