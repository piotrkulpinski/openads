import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router"
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

  return <Outlet />
}

export default function Router() {
  return (
    <BrowserRouter>
      <TRPCProvider>
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
      </TRPCProvider>
    </BrowserRouter>
  )
}
