import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@openads/ui/dialog"
import { EmbedCodeGenerator } from "~/components/embed/embed-code-generator"
import { HeaderDescription, HeaderRoot, HeaderTitle } from "~/components/ui/header"
import { useWorkspace } from "~/contexts/workspace-context"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmbedModal({ open, onOpenChange }: Props) {
  const { id } = useWorkspace()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent fixed={false} size="5xl">
        <HeaderRoot>
          <DialogTitle asChild>
            <HeaderTitle size="h4">Embed Code Generator</HeaderTitle>
          </DialogTitle>

          <DialogDescription asChild>
            <HeaderDescription>
              Customize how your ad zones widget will appear on your website.
            </HeaderDescription>
          </DialogDescription>
        </HeaderRoot>

        <EmbedCodeGenerator workspaceId={id} />
      </DialogContent>
    </Dialog>
  )
}
