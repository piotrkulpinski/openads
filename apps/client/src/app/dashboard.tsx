import { Button } from "@openads/ui/button"
import { Navigate } from "react-router"
import { signOut, useSession } from "../lib/auth"
import { trpc } from "../lib/trpc"

export default function DashboardPage() {
  const { data: session } = useSession()
  const { data: userData, isLoading } = trpc.user.me.useQuery()

  if (!session?.user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button onClick={() => signOut()}>Sign Out</Button>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
            <div className="space-y-2">
              <p>
                <strong>ID:</strong> {userData?.id}
              </p>
              <p>
                <strong>Email:</strong> {userData?.email}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
