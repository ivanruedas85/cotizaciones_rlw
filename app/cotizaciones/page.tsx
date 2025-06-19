import { QuotationList } from "@/components/quotation-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, BarChart3 } from "lucide-react"

export default function QuotationsPage() {
  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Cotizaciones</h1>
            <p className="text-gray-600">Gestione todas sus cotizaciones en un solo lugar</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            <Link href="/cotizaciones/dashboard">
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/" className="mt-4 sm:mt-0">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Cotización
              </Button>
            </Link>
          </div>
        </div>

        <QuotationList />
      </div>
    </main>
  )
}

