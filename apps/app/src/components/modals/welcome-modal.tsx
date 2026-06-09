import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@openads/ui/dialog"
import { ArrowRightIcon } from "lucide-react"
import { Header, HeaderDescription, HeaderTitle } from "~/components/ui/header"
import { LogoSymbol } from "~/components/ui/logo-symbol"
import { siteConfig } from "~/config/site"

type WelcomeModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const WelcomeModal = ({ open, onOpenChange }: WelcomeModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="-m-6 mb-0 flex justify-center bg-primary-foreground border-b p-12 rounded-t-lg">
          <LogoSymbol className="size-12" />
        </div>

        <Header gap="sm" alignment="center" className="max-w-sm mx-auto">
          <DialogTitle asChild>
            <HeaderTitle>Welcome to {siteConfig.name}!</HeaderTitle>
          </DialogTitle>

          <DialogDescription asChild>
            <HeaderDescription className="max-w-md">
              Thanks for signing up – your account is ready to go! Set up your tiers and custom
              fields, then drop the embed widget on your site to start taking advertiser
              subscriptions.
            </HeaderDescription>
          </DialogDescription>

          <DialogClose size="lg" className="mt-4 w-full" suffix={<ArrowRightIcon />}>
            Get Started
          </DialogClose>
        </Header>
      </DialogContent>
    </Dialog>
  )
}
