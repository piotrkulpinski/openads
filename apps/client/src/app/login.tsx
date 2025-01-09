import { Navigate } from "react-router"
import { LoginButton } from "~/components/auth/login-button"
import { useSession } from "../lib/auth"

export default function LoginPage() {
  const { data: session } = useSession()

  if (session?.user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6">
        <h1 className="text-2xl font-bold mb-6">Sign In</h1>

        <LoginButton provider="google" />
      </div>
    </div>
  )
}
