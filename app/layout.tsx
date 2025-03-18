import type React from "react"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Sidebar from "@/components/sidebar"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster as ReactHotToastToaster } from 'react-hot-toast'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Registros Medicos",
  description: "Sistema de Registros Medicos",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <div className="flex h-screen">
              <Sidebar />
              <div className="flex-1 overflow-auto">
                <main className="p-6">{children}</main>
              </div>
            </div>
            <Toaster />
            <ReactHotToastToaster position="top-right" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'