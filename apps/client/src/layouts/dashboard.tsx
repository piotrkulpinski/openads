import { Outlet } from "react-router"
import { Sidebar } from "~/components/sidebar"

export default function DashboardLayout() {
  return (
    <div className="flex items-stretch size-full">
      <Sidebar />

      <div className="grid grid-cols-1 content-start gap-4 p-4 flex-1 sm:px-6">
        <Outlet />
      </div>
    </div>
  )
}
