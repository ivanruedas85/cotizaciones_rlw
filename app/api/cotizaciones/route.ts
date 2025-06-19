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

// GET - Obtener todas las cotizaciones
export async function GET() {
    try {
        const fileContents = await fs.readFile(cotizacionesFilePath, "utf8")
        const cotizaciones = JSON.parse(fileContents)
        return NextResponse.json(cotizaciones)
    } catch (error) {
        console.error("Error al leer cotizaciones:", error)
        return NextResponse.json({ error: "Error al obtener cotizaciones" }, { status: 500 })
    }
}

// POST - Crear una nueva cotización
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { clienteId, cliente, descripcion, estado, detalles, insumos, total } = body

        // Validación básica
        if (!clienteId || !cliente || !descripcion) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
        }

        // Leer cotizaciones existentes
        let cotizaciones: Cotizacion[] = []
        try {
            const fileContents = await fs.readFile(cotizacionesFilePath, "utf8")
            cotizaciones = JSON.parse(fileContents)
        } catch (error) {
            // Si el archivo no existe, empezamos con un array vacío
            console.log("Archivo de cotizaciones no existe, creando uno nuevo")
        }

        // Generar nuevo ID
        const ultimoNumero =
            cotizaciones.length > 0 ? Math.max(...cotizaciones.map((c) => Number.parseInt(c.id.split("-")[1]))) : 0
        const nuevoId = `COT-${String(ultimoNumero + 1).padStart(3, "0")}`

        // Crear nueva cotización
        const nuevaCotizacion: Cotizacion = {
            id: nuevoId,
            fecha: new Date().toISOString().split("T")[0],
            estado: estado || "Pendiente",
            clienteId,
            cliente,
            descripcion: descripcion.trim(),
            detalles,
            insumos: insumos || [],
            total,
        }

        // Agregar la nueva cotización
        cotizaciones.push(nuevaCotizacion)

        // Guardar en el archivo
        await fs.writeFile(cotizacionesFilePath, JSON.stringify(cotizaciones, null, 2), "utf8")

        return NextResponse.json(nuevaCotizacion, { status: 201 })
    } catch (error) {
        console.error("Error al crear cotización:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
