import { type NextRequest, NextResponse } from "next/server"
import { CotizacionDB } from "@/utils/cotizacion-db-service"

// GET - Generar reporte de ventas
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const fechaInicio = searchParams.get("fechaInicio")
        const fechaFin = searchParams.get("fechaFin")

        if (!fechaInicio || !fechaFin) {
            return NextResponse.json({ error: "Se requieren fechaInicio y fechaFin" }, { status: 400 })
        }

        const reporte = await CotizacionDB.generateSalesReport(fechaInicio, fechaFin)
        return NextResponse.json(reporte)
    } catch (error) {
        console.error("Error al generar reporte:", error)
        return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 })
    }
}
