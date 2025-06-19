"use client"

import { useParams } from "next/navigation"
import { QuotationDetail } from "@/components/quotation-detail"
import cotizacionesData from "@/data/cotizaciones.json"
import clientesData from "@/data/clientes.json"

export default function QuotationDetailPage() {
  const params = useParams()
  const quotationId = params.id as string

  // Buscar la cotización por ID
  const quotation = cotizacionesData.find((q) => q.id === quotationId)

  // Si no se encuentra la cotización, mostrar mensaje de error
  if (!quotation) {
    return (
      <div className="min-h-screen p-4 md:p-8 lg:p-12 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Cotización no encontrada</h1>
          <p className="text-gray-600 mb-4">La cotización con ID {quotationId} no existe o ha sido eliminada.</p>
        </div>
      </div>
    )
  }

  // Buscar información adicional del cliente
  const clienteCompleto = clientesData.find((c) => c.id === quotation.clienteId)

  // Combinar la información del cliente
  const quotationWithFullClient = {
    ...quotation,
    cliente: {
      ...quotation.cliente,
      email: clienteCompleto?.email,
      direccion: clienteCompleto?.direccion,
    },
  }

  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-gray-50 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto">
        <QuotationDetail quotation={quotationWithFullClient} />
      </div>
    </main>
  )
}
