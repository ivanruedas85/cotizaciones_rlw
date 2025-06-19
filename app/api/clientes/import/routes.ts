import { type NextRequest, NextResponse } from "next/server"
import { ClienteDB } from "@/utils/db-services"

// POST - Importar clientes desde JSON
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        if (!body.data) {
            return NextResponse.json({ error: "No se proporcionaron datos para importar" }, { status: 400 })
        }

        const resultado = await ClienteDB.importFromJSON(body.data)
        return NextResponse.json(resultado)
    } catch (error) {
        console.error("Error al importar clientes:", error)
        return NextResponse.json({ error: "Error al importar clientes" }, { status: 500 })
    }
}