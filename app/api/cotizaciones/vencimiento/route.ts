import { type NextRequest, NextResponse } from "next/server"
import { CotizacionDB } from "@/utils/cotizacion-db-service"

// GET - Obtener cotizaciones próximas a vencer
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const dias = searchParams.get("dias") ? Number.parseInt(searchParams.get("dias")!) : 7

        const cotizaciones = await CotizacionDB.getCotizacionesProximasVencer(dias)
        return NextResponse.json(cotizaciones)
    } catch (error) {
        console.error("Error al obtener cotizaciones próximas a vencer:", error)
        return NextResponse.json({ error: "Error al obtener cotizaciones" }, { status: 500 })
    }
}
