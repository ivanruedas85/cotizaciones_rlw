import { type NextRequest, NextResponse } from "next/server"
import { ClienteDB } from "@/utils/db-services"

// GET - Obtener todos los clientes o buscar por criterios
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams

        // Verificar si hay parámetros de búsqueda
        if (searchParams.size > 0) {
            const criteria = {
                nombre: searchParams.get("nombre") || undefined,
                telefono: searchParams.get("telefono") || undefined,
                email: searchParams.get("email") || undefined,
                categoria: searchParams.get("categoria") || undefined,
                fechaDesde: searchParams.get("fechaDesde") || undefined,
                fechaHasta: searchParams.get("fechaHasta") || undefined,
            }

            const clientes = await ClienteDB.search(criteria)
            return NextResponse.json(clientes)
        }

        // Si no hay parámetros, devolver todos los clientes
        const clientes = await ClienteDB.getAll()
        return NextResponse.json(clientes)
    } catch (error) {
        console.error("Error al obtener clientes:", error)
        return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 })
    }
}

// POST - Crear un nuevo cliente
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Intentar crear el cliente
        const nuevoCliente = await ClienteDB.create(body)

        return NextResponse.json(nuevoCliente, { status: 201 })
    } catch (error) {
        console.error("Error al crear cliente:", error)

        // Determinar el tipo de error para devolver el código adecuado
        if (error instanceof Error) {
            if (error.message.includes("teléfono")) {
                return NextResponse.json({ error: error.message }, { status: 409 }) // Conflict
            } else if (error.message.includes("obligatorios")) {
                return NextResponse.json({ error: error.message }, { status: 400 }) // Bad Request
            } else if (error.message.includes("email")) {
                return NextResponse.json({ error: error.message }, { status: 400 }) // Bad Request
            }
        }

        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
