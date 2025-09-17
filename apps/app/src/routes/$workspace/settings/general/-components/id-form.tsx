import { useClipboard } from "@mantine/hooks"
import { Button } from "@openads/ui/button"
import { Input } from "@openads/ui/input"
import { Tooltip } from "@openads/ui/tooltip"
import { CheckIcon, CopyIcon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { Card } from "~/components/ui/card"
import { Header } from "~/components/ui/header"
import { Prose } from "~/components/ui/prose"
import { siteConfig } from "~/config/site"
import { useWorkspace } from "~/contexts/workspace-context"

export const IdForm = ({ ...props }: HTMLAttributes<HTMLElement>) => {
  const workspace = useWorkspace()
  const clipboard = useClipboard({ timeout: 3000 })

  return (
    <Card {...props}>
      <Card.Section>
        <Header
          title="Workspace ID"
          description={`Unique ID of your workspace on ${siteConfig.name}.`}
        />

        <div className="relative max-w-xl">
          <Input readOnly value={workspace.id} />

          <Tooltip tooltip="Copy to clipboard">
            <Button
              size="sm"
              variant="ghost"
              prefix={
                clipboard.copied ? (
                  <CheckIcon className="size-4 text-green-500" />
                ) : (
                  <CopyIcon className="size-4" />
                )
              }
              disabled={clipboard.copied}
              onClick={() => clipboard.copy(workspace.id)}
              aria-label="Copy"
              className="absolute right-1 top-1/2 -translate-y-1/2"
            />
          </Tooltip>
        </div>
      </Card.Section>

      <Card.Row>
        <Prose>
          Used to identify your workspace when interacting with the {siteConfig.name} API.
        </Prose>
      </Card.Row>
    </Card>
  )
}
