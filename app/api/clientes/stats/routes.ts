import { NextResponse } from "next/server";
import { ClienteDB } from "@/utils/db-services";

// GET - Obtener estadisticas de clientes
export async function GET() {
    try {
        const stats = await ClienteDB.getStats()
        return NextResponse.json(stats)
    } catch (error) {
        console.error("Error al obtener estadísticas", error)
        return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
    }
}