import { type NextRequest, NextResponse } from "next/server"
import { ClienteDB } from "@/utils/db-services"

// GET - Obtener un cliente específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const cliente = await ClienteDB.getById(params.id)

        if (!cliente) {
            return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
        }

        return NextResponse.json(cliente)
    } catch (error) {
        console.error("Error al obtener cliente:", error)
        return NextResponse.json({ error: "Error al obtener cliente" }, { status: 500 })
    }
}

// PUT - Actualizar un cliente
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await request.json()

        // Intentar actualizar el cliente
        const clienteActualizado = await ClienteDB.update(params.id, body)

        return NextResponse.json(clienteActualizado)
    } catch (error) {
        console.error("Error al actualizar cliente:", error)

        // Determinar el tipo de error para devolver el código adecuado
        if (error instanceof Error) {
            if (error.message.includes("no encontrado")) {
                return NextResponse.json({ error: error.message }, { status: 404 })
            } else if (error.message.includes("teléfono")) {
                return NextResponse.json({ error: error.message }, { status: 409 })
            } else if (error.message.includes("email")) {
                return NextResponse.json({ error: error.message }, { status: 400 })
            }
        }

        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}

// DELETE - Eliminar un cliente
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const resultado = await ClienteDB.delete(params.id)

        if (!resultado) {
            return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
        }

        return NextResponse.json({ message: "Cliente eliminado correctamente" })
    } catch (error) {
        console.error("Error al eliminar cliente:", error)

        // Determinar el tipo de error para devolver el código adecuado
        if (error instanceof Error && error.message.includes("no encontrado")) {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }

        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
