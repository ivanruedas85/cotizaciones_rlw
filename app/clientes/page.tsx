import { ClientList } from "@/components/client-list"
import { Button } from "@/components/ui/button"
import { PlusCircle, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function ClientesPage() {
  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Clientes</h1>
            <p className="text-muted-foreground">Gestione su cartera de clientes</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            <Link href="/clientes/dashboard">
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/clientes/nuevo">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Cliente
              </Button>
            </Link>
          </div>
        </div>

        <ClientList />
      </div>
    </main>
  )
}

