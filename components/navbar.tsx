"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileText, Home, Menu, X, Package, Users } from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { SITE_SMALL_TITLE } from "@/utils/const"

export function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="border-b bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-foreground">
              {SITE_SMALL_TITLE}
            </Link>
          </div>

          {/* Navegación para escritorio */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/" passHref>
              <Button variant={pathname === "/" ? "default" : "ghost"} className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Inicio
              </Button>
            </Link>
            <Link href="/cotizaciones" passHref>
              <Button variant={pathname === "/cotizaciones" ? "default" : "ghost"} className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Cotizaciones
              </Button>
            </Link>
            <Link href="/insumos" passHref>
              <Button variant={pathname === "/insumos" ? "default" : "ghost"} className="flex items-center">
                <Package className="mr-2 h-4 w-4" />
                Insumos
              </Button>
            </Link>
            <Link href="/clientes" passHref>
              <Button variant={pathname === "/clientes" ? "default" : "ghost"} className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Clientes
              </Button>
            </Link>
            <ThemeToggle />
          </nav>

          {/* Botones móviles (tema y menú) */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="flex flex-col space-y-2 p-4">
            <Link href="/" passHref>
              <Button
                variant={pathname === "/" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="mr-2 h-4 w-4" />
                Inicio
              </Button>
            </Link>
            <Link href="/cotizaciones" passHref>
              <Button
                variant={pathname === "/cotizaciones" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setIsMenuOpen(false)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Cotizaciones
              </Button>
            </Link>
            <Link href="/insumos" passHref>
              <Button
                variant={pathname === "/insumos" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setIsMenuOpen(false)}
              >
                <Package className="mr-2 h-4 w-4" />
                Insumos
              </Button>
            </Link>
            <Link href="/clientes" passHref>
              <Button
                variant={pathname === "/clientes" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="mr-2 h-4 w-4" />
                Clientes
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
