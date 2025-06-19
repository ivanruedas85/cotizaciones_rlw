import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

// Tipo para las cotizaciones
type Cotizacion = {
    id: string
    fecha: string
    estado: string
    clienteId: string
    cliente: {
        nombre: string
        telefono: string
    }
    descripcion: string
    detalles: {
        precioPiel: number
        alto: number
        largo: number
        porcentaje: number
        precioUnitario: number
        precioResiduo: number
        totalResiduo: number
        valorInsumos: number
    }
    insumos: {
        id: string
        nombre: string
        cantidad: number
        precioUnitario: number
    }[]
    total: number
}

// Ruta del archivo JSON
const cotizacionesFilePath = path.join(process.cwd(), "data", "cotizaciones.json")

// GET - Obtener una cotización específica
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const fileContents = await fs.readFile(cotizacionesFilePath, "utf8")
        const cotizaciones: Cotizacion[] = JSON.parse(fileContents)
        const cotizacion = cotizaciones.find((c) => c.id === params.id)

        if (!cotizacion) {
            return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 })
        }

        return NextResponse.json(cotizacion)
    } catch (error) {
        console.error("Error al obtener cotización:", error)
        return NextResponse.json({ error: "Error al obtener cotización" }, { status: 500 })
    }
}

// PUT - Actualizar una cotización
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await request.json()
        const { estado } = body

        // Leer cotizaciones existentes
        const fileContents = await fs.readFile(cotizacionesFilePath, "utf8")
        const cotizaciones: Cotizacion[] = JSON.parse(fileContents)

        // Encontrar la cotización a actualizar
        const cotizacionIndex = cotizaciones.findIndex((c) => c.id === params.id)
        if (cotizacionIndex === -1) {
            return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 })
        }

        // Actualizar la cotización
        if (estado) {
            cotizaciones[cotizacionIndex].estado = estado
        }

        // Guardar en el archivo
        await fs.writeFile(cotizacionesFilePath, JSON.stringify(cotizaciones, null, 2), "utf8")

        return NextResponse.json(cotizaciones[cotizacionIndex])
    } catch (error) {
        console.error("Error al actualizar cotización:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}

// DELETE - Eliminar una cotización
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Leer cotizaciones existentes
        const fileContents = await fs.readFile(cotizacionesFilePath, "utf8")
        const cotizaciones: Cotizacion[] = JSON.parse(fileContents)

        // Encontrar la cotización a eliminar
        const cotizacionIndex = cotizaciones.findIndex((c) => c.id === params.id)
        if (cotizacionIndex === -1) {
            return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 })
        }

        // Eliminar la cotización
        const cotizacionEliminada = cotizaciones.splice(cotizacionIndex, 1)[0]

        // Guardar en el archivo
        await fs.writeFile(cotizacionesFilePath, JSON.stringify(cotizaciones, null, 2), "utf8")

        return NextResponse.json({ message: "Cotización eliminada correctamente", cotizacion: cotizacionEliminada })
    } catch (error) {
        console.error("Error al eliminar cotización:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
