import { type NextRequest, NextResponse } from "next/server"
import { CotizacionDB } from "@/utils/cotizacion-db-service"

// GET - Exportar cotizaciones a JSON
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const filtros = {
            fechaInicio: searchParams.get("fechaInicio") || undefined,
            fechaFin: searchParams.get("fechaFin") || undefined,
            estado: (searchParams.get("estado") as any) || undefined,
        }

        const jsonData = await CotizacionDB.exportToJSON(filtros)

        return new NextResponse(jsonData, {
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="cotizaciones-export-${new Date().toISOString().split("T")[0]}.json"`,
            },
        })
    } catch (error) {
        console.error("Error al exportar cotizaciones:", error)
        return NextResponse.json({ error: "Error al exportar cotizaciones" }, { status: 500 })
    }
}
