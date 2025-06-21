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

// GET - Obtener un insumo específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const fileContents = await fs.readFile(insumosFilePath, "utf8")
        const insumos: Insumo[] = JSON.parse(fileContents)
        const insumo = insumos.find((i) => i.id === params.id)

        if (!insumo) {
            return NextResponse.json({ error: "Insumo no encontrado" }, { status: 404 })
        }

        return NextResponse.json(insumo)
    } catch (error) {
        console.error("Error al obtener insumo:", error)
        return NextResponse.json({ error: "Error al obtener insumo" }, { status: 500 })
    }
}

// PUT - Actualizar un insumo
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
        const fileContents = await fs.readFile(insumosFilePath, "utf8")
        const insumos: Insumo[] = JSON.parse(fileContents)

        // Encontrar el insumo a actualizar
        const insumoIndex = insumos.findIndex((i) => i.id === params.id)
        if (insumoIndex === -1) {
            return NextResponse.json({ error: "Insumo no encontrado" }, { status: 404 })
        }

        // Verificar si ya existe otro insumo con el mismo nombre
        const insumoExistente = insumos.find(
            (insumo) => insumo.nombre.toLowerCase() === nombre.toLowerCase().trim() && insumo.id !== params.id,
        )
        if (insumoExistente) {
            return NextResponse.json({ error: "Ya existe otro insumo con este nombre" }, { status: 409 })
        }

        // Actualizar el insumo
        insumos[insumoIndex] = {
            ...insumos[insumoIndex],
            nombre: nombre.trim(),
            precio_volumen: Number(precio_volumen),
            cantidad_volumen: Number(cantidad_volumen),
            precio_unidad: Number(precio_unidad),
            descripcion: descripcion?.trim() || "",
        }

        // Guardar en el archivo
        await fs.writeFile(insumosFilePath, JSON.stringify(insumos, null, 2), "utf8")

        return NextResponse.json(insumos[insumoIndex])
    } catch (error) {
        console.error("Error al actualizar insumo:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}

// DELETE - Eliminar un insumo
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Leer insumos existentes
        const fileContents = await fs.readFile(insumosFilePath, "utf8")
        const insumos: Insumo[] = JSON.parse(fileContents)

        // Encontrar el insumo a eliminar
        const insumoIndex = insumos.findIndex((i) => i.id === params.id)
        if (insumoIndex === -1) {
            return NextResponse.json({ error: "Insumo no encontrado" }, { status: 404 })
        }

        // Eliminar el insumo
        const insumoEliminado = insumos.splice(insumoIndex, 1)[0]

        // Guardar en el archivo
        await fs.writeFile(insumosFilePath, JSON.stringify(insumos, null, 2), "utf8")

        return NextResponse.json({ message: "Insumo eliminado correctamente", insumo: insumoEliminado })
    } catch (error) {
        console.error("Error al eliminar insumo:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
