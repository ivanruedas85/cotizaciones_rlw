import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/footer"
import { DESCRIPTION_SITE, SITE_LARGE_TITLE } from "@/utils/const"

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
          <div className="min-h-screen bg-[url(/img/fondo_carteras.png)] bg-origin-border p-3 bg-center bg-no-repeat bg-cover text-foreground"> {/* bg-background */}
            <Navbar />
            {children}
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
