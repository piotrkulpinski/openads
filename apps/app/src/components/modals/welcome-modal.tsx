import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@openads/ui/dialog"
import { ArrowRightIcon } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import { useCallback, useMemo, useState } from "react"
import { Intro, IntroDescription, IntroTitle } from "~/components/ui/intro"
import { LogoSymbol } from "~/components/ui/logo-symbol"
import { siteConfig } from "~/config/site"

type WelcomeModalProps = {
  showWelcomeModal: boolean
  setShowWelcomeModal: Dispatch<SetStateAction<boolean>>
  onClose?: () => void
}

const WelcomeModal = ({ showWelcomeModal, setShowWelcomeModal, onClose }: WelcomeModalProps) => {
  const handleOpenChange = (open: boolean) => {
    setShowWelcomeModal(open)

    if (!open) {
      onClose?.()
    }
  }

  return (
    <Dialog open={showWelcomeModal} onOpenChange={handleOpenChange}>
      <DialogContent>
        <div className="-m-6 mb-0 flex justify-center bg-primary-foreground border-b p-12 rounded-t-lg">
          <LogoSymbol className="size-12" />
        </div>

        <Intro alignment="center" className="max-w-sm mx-auto">
          <DialogTitle asChild>
            <IntroTitle>Welcome to {siteConfig.name}!</IntroTitle>
          </DialogTitle>

          <DialogDescription asChild>
            <IntroDescription className="max-w-md">
              Thanks for signing up – your account is ready to go! Now you have one central,
              organized place to manage all your ad spots and bookings.
            </IntroDescription>
          </DialogDescription>

          <DialogClose size="lg" className="mt-4 w-full" suffix={<ArrowRightIcon />}>
            Get Started
          </DialogClose>
        </Intro>
      </DialogContent>
    </Dialog>
  )
}

export function useWelcomeModal() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  const WelcomeModalCallback = useCallback(
    ({ onClose }: Omit<WelcomeModalProps, "showWelcomeModal" | "setShowWelcomeModal">) => (
      <WelcomeModal
        showWelcomeModal={showWelcomeModal}
        setShowWelcomeModal={setShowWelcomeModal}
        onClose={onClose}
      />
    ),
    [showWelcomeModal, setShowWelcomeModal],
  )

  return useMemo(
    () => ({
      setShowWelcomeModal,
      WelcomeModal: WelcomeModalCallback,
    }),
    [setShowWelcomeModal, WelcomeModalCallback],
  )
}
