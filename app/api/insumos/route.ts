import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

// Tipo para los insumos
type Insumo = {
    id: string
    nombre: string
    precio_volumen: number
    cantidad_volumen: number
    precio_unidad: number
    descripcion: string
}

// Ruta del archivo JSON
const insumosFilePath = path.join(process.cwd(), "data", "insumos.json")

// GET - Obtener todos los insumos
export async function GET() {
    try {
        const fileContents = await fs.readFile(insumosFilePath, "utf8")
        const insumos = JSON.parse(fileContents)
        return NextResponse.json(insumos)
    } catch (error) {
        console.error("Error al leer insumos:", error)
        return NextResponse.json({ error: "Error al obtener insumos" }, { status: 500 })
    }
}

// POST - Crear un nuevo insumo
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { nombre, precio_volumen, cantidad_volumen, precio_unidad, descripcion } = body

        // Validación básica
        if (!nombre || precio_volumen === undefined || cantidad_volumen === undefined || precio_unidad === undefined) {
            return NextResponse.json({ error: "Todos los campos son obligatorios excepto la descripción" }, { status: 400 })
        }

        // Validar que los números sean positivos
        if (precio_volumen < 0 || cantidad_volumen < 0 || precio_unidad < 0) {
            return NextResponse.json({ error: "Los valores numéricos deben ser positivos" }, { status: 400 })
        }

        // Leer insumos existentes
        let insumos: Insumo[] = []
        try {
            const fileContents = await fs.readFile(insumosFilePath, "utf8")
            insumos = JSON.parse(fileContents)
        } catch (error) {
            // Si el archivo no existe, empezamos con un array vacío
            console.log("Archivo de insumos no existe, creando uno nuevo")
        }

        // Verificar si ya existe un insumo con el mismo nombre
        const insumoExistente = insumos.find((insumo) => insumo.nombre.toLowerCase() === nombre.toLowerCase().trim())
        if (insumoExistente) {
            return NextResponse.json({ error: "Ya existe un insumo con este nombre" }, { status: 409 })
        }

        // Generar nuevo ID
        const nuevoId = insumos.length > 0 ? (Math.max(...insumos.map((i) => Number.parseInt(i.id))) + 1).toString() : "1"

        // Crear nuevo insumo
        const nuevoInsumo: Insumo = {
            id: nuevoId,
            nombre: nombre.trim(),
            precio_volumen: Number(precio_volumen),
            cantidad_volumen: Number(cantidad_volumen),
            precio_unidad: Number(precio_unidad),
            descripcion: descripcion?.trim() || "",
        }

        // Agregar el nuevo insumo
        insumos.push(nuevoInsumo)

        // Guardar en el archivo
        await fs.writeFile(insumosFilePath, JSON.stringify(insumos, null, 2), "utf8")

        return NextResponse.json(nuevoInsumo, { status: 201 })
    } catch (error) {
        console.error("Error al crear insumo:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
