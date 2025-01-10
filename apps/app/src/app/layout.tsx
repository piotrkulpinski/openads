import { Outlet } from "react-router"
import Layout from "~/layouts/layout"

export default function AppLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}
