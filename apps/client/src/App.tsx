import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router"
import { useSession } from "~/lib/auth"
import DashboardPage from "./app/dashboard"
import LoginPage from "./app/login"
import { TRPCProvider } from "./providers/app"

const AuthLayout = () => {
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

export default function App() {
  return (
    <BrowserRouter>
      <TRPCProvider>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/" element={<DashboardPage />} />
          </Route>
        </Routes>
      </TRPCProvider>
    </BrowserRouter>
  )
}
