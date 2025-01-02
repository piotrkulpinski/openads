import type { ReactNode } from "@tanstack/react-router"
import { AppSidebar } from "~/components/app-sidebar"
import { SidebarProvider } from "~/components/ui/sidebar"
import { SidebarInset } from "~/components/ui/sidebar"

export function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
