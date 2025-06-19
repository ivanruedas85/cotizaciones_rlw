import { NextResponse } from "next/server"
import { CotizacionDB } from "@/utils/cotizacion-db-service"

// GET - Obtener estadísticas de cotizaciones
export async function GET() {
    try {
        const stats = await CotizacionDB.getStats()
        return NextResponse.json(stats)
    } catch (error) {
        console.error("Error al obtener estadísticas:", error)
        return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
    }
}
