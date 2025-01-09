import { Provider as Analytics } from "@openads/events/client"
import { TooltipProvider } from "@openads/ui/tooltip"
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router"
import { Toaster } from "~/components/toaster"
import { env } from "~/env"
import AuthLayout from "~/layouts/auth"
import DashboardLayout from "~/layouts/dashboard"
import { useSession } from "~/lib/auth"
import DashboardPage from "./app/dashboard"
import LoginPage from "./app/login"
import { TRPCProvider } from "./providers/app"

const Layout = () => {
  const { data: auth, isPending } = useSession()
  const { pathname } = useLocation()

  if (isPending) {
    return <div>Loading...</div>
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
        <Route element={<Layout />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Route>
      </Routes>

      <Analytics clientId={env.VITE_OPENPANEL_CLIENT_ID} />
      <Toaster />
    </BrowserRouter>
  )
}
