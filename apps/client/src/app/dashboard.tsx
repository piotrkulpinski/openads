import { Navigate } from "react-router"
import { useSession } from "../lib/auth"
import { trpc } from "../lib/trpc"

export default function DashboardPage() {
  const { data: session } = useSession()
  const { data: userId, isLoading } = trpc.user.me.useQuery()

  if (!session?.user) {
    return <Navigate to="/login" replace />
  }

  return "Dashboard"
}
