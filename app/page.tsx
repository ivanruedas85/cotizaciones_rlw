import { SalesQuotationForm } from "@/components/sales-quotation-form"
import { DESCRIPTION_SITE } from "@/utils/const"
import { Glass } from "@/components/ui/glass"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <Glass className="mb-8 p-6" blur="lg" opacity={0.2} enhanced>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">{DESCRIPTION_SITE}</h1>
          <p className="text-muted-foreground">Calcule precios y genere cotizaciones fácilmente</p>
        </Glass>
        <SalesQuotationForm />
      </div>
    </main>
  )
}
