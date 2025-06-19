import { SalesQuotationForm } from "@/components/sales-quotation-form"
import {DESCRIPTION_SITE} from "@/utils/const.ts"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800">{DESCRIPTION_SITE}</h1>
        <p className="text-gray-600 mb-8">Calcule precios y genere cotizaciones fácilmente</p>
        <SalesQuotationForm />
      </div>
    </main>
  )
}
