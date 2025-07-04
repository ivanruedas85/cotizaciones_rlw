import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/footer"
import { DESCRIPTION_SITE, SITE_LARGE_TITLE } from "@/utils/const"
import { AnimatedBackground } from "@/components/animated-backgrounds"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: { SITE_LARGE_TITLE },
  description: { DESCRIPTION_SITE },
  manifest: "/site.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon-32x32.png",
    other: [
      {
        rel: "icon",
        url: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png"
      },
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="min-h-screen text-foreground flex flex-col relative">
            <AnimatedBackground />
            <Navbar />
            <main className="flex-1 relative z-10">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
