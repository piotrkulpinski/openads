import { Provider as Analytics } from "@openads/events/client"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import type { PropsWithChildren } from "react"
import { Toaster } from "~/components/toaster"
import { siteConfig } from "~/config/site"

import "./styles.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}>
      <body className="flex flex-col min-h-dvh font-sans antialiased">
        {children}
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
