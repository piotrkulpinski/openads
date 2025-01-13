import { Provider as Analytics } from "@openads/events/client"
import { TooltipProvider } from "@openads/ui/tooltip"
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router"
import LoginPage from "~/app/auth/login/page"
import DashboardLayout from "~/app/dashboard/layout"
import DashboardPage from "~/app/dashboard/page"
import SpotsIndexPage from "~/app/dashboard/spots"
import SpotsEditPage from "~/app/dashboard/spots/edit"
import SpotsNewPage from "~/app/dashboard/spots/new"
import AppLayout from "~/app/layout"
import NotFound from "~/app/not-found"
import OnboardingPage from "~/app/onboarding/page"
import OnboardingSpotPage from "~/app/onboarding/spot/page"
import OnboardingWorkspacePage from "~/app/onboarding/workspace/page"
import HomePage from "~/app/page"
import { Toaster } from "~/components/toaster"
import { env } from "~/env"
import { useSession } from "~/lib/auth"
import { TRPCProvider } from "~/providers/app"

const Providers = () => {
  const { data: auth, isPending } = useSession()
  const { pathname } = useLocation()

  if (isPending) {
    return null
  }

  if (!auth && pathname !== "/login") {
    return <Navigate to="/login" replace />
  }

  return (
    <TRPCProvider>
      <TooltipProvider delayDuration={250}>
        <Outlet />
      </TooltipProvider>
    </TRPCProvider>
  )
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Providers />}>
          <Route path="/" element={<HomePage />} />

          {/* Dashboard route group */}
          <Route path=":workspace" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />

            {/* Spots */}
            <Route path="spots" element={<SpotsIndexPage />} />
            <Route path="spots/new" element={<SpotsNewPage />} />
            <Route path="spots/:spotId" element={<SpotsEditPage />} />
          </Route>

          <Route element={<AppLayout />}>
            {/* Onboarding route group */}
            <Route path="onboarding">
              <Route index element={<OnboardingPage />} />
              <Route path="workspace" element={<OnboardingWorkspacePage />} />
              <Route path="spot" element={<OnboardingSpotPage />} />
            </Route>

            <Route path="login" element={<LoginPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>

      <Analytics clientId={env.VITE_OPENPANEL_CLIENT_ID} />
      <Toaster />
    </BrowserRouter>
  )
}
