import { promises as fs } from "fs"
import { CircleArrowOutDownRight, FoldHorizontal } from "lucide-react"
import path from "path"

// Tipos para la base de datos
export type Cliente = {
    id: string
    nombre: string
    telefono: string
    email?: string
    direccion?: string
    fechaRegistro: string
    categoria?: string
    notas?: string
    ultimaCompras?: string
    totalCompras?: number
}

// Rutas de los archivos JSON
const clientesFilePath = path.join(process.cwd(), "data", "clientes.json")
const backupDir = path.join(process.cwd(), "data", "backups")

// Clase para gestionar la base de datos de clientes
export class ClienteDB {
    // Obtener todos los clientes
    static async getAll(): Promise<Cliente[]> {
        try {
            const fileContents = await fs.readFile(clientesFilePath, "utf8")
            return JSON.parse(fileContents)
        } catch (error) {
            console.error("Error al leer clientes:", error)
            // Si el archivo no existe, devolver un array vacio
            return []
        }
    }
    // Obtener un cliente por ID
    static async getById(id: string): Promise<Cliente | null> {
        try {
            const clientes = await this.getAll()
            return clientes.find((c) => c.id === id) || null
        } catch (error) {
            console.error(`Error al obtener cliente con ID ${id}:`, error)
            return null
        }
    }

    // Buscar clientes por criterio
    static async search(criteria: {
        nombre?: string
        telefono?: string
        email?: string
        categoria?: string
        fechaDesde?: string
        fechaHasta?: string
    }): Promise<Cliente[]> {
        try {
            const clientes = await this.getAll()

            return clientes.filter((cliente) => {
                let match = true

                if (criteria.nombre && !cliente.nombre.toLocaleLowerCase().includes(criteria.nombre.toLocaleLowerCase())) {
                    match = false
                }

                if (criteria.telefono && !cliente.telefono.includes(criteria.telefono)) {
                    match = false
                }

                if (criteria.email && cliente.email && !cliente.email.toLowerCase().includes(criteria.email.toLowerCase())) {
                    match = false
                }

                if (criteria.categoria && cliente.categoria !== criteria.categoria) {
                    match = false
                }

                if (criteria.fechaDesde && cliente.fechaRegistro < criteria.fechaDesde) {
                    match = false
                }
                if (criteria.fechaDesde && cliente.fechaRegistro > criteria.fechaHasta) {
                    match = false
                }
                return match
            })
        } catch (error) {
            console.error("Error al buscar clientes:", error)
            return []
        }
    }
    // Crear un nuevo cliente
    static async create(cliente: Omit<Cliente, "id" | "fechaRegistro">): Promise<Cliente | null> {
        try {
            // Crear backup antes de modificar
            await this.createBackup()

            // Validar datos
            if (!cliente.nombre || !cliente.telefono) {
                throw new Error("Nombre y teléfono son obligatorios")
            }

            // Validar formato de email si existe
            if (cliente.email && !this.isValidEmail(cliente.email)) {
                throw new Error("Formato de email inválido")
            }

            // Obtener clientes existentes
            const clientes = await this.getAll()

            // Verificar si ya existe un cliente con el mismo teléfono
            if (clientes.some((c) => c.telefono === cliente.telefono)) {
                throw new Error("Ya existe un cliente con este número de teléfono")
            }

            // Generar nuevo ID
            const nuevoId =
                clientes.length > 0 ? (Math.max(...clientes.map((c) => Number.parseInt(c.id))) + 1).toString() : "1"

            // Crear nuevo cliente con fecha actual
            const nuevoCliente: Cliente = {
                id: nuevoId,
                nombre: cliente.nombre.trim(),
                telefono: cliente.telefono.trim(),
                email: cliente.email?.trim(),
                direccion: cliente.direccion?.trim(),
                fechaRegistro: new Date().toISOString().split("T")[0],
                categoria: cliente.categoria,
                notas: cliente.notas,
            }

            // Agregar el nuevo cliente
            clientes.push(nuevoCliente)

            // Guardar en el archivo
            await this.saveClientes(clientes)

            return nuevoCliente
        } catch (error) {
            console.error("Error al crear cliente:", error)
            throw error
        }
    }

    // Actualizar un cliente existente
    static async update(id: string, clienteData: Partial<Cliente>): Promise<Cliente | null> {
        try {
            // Crear backup antes de modificar
            await this.createBackup()

            // Obtener clientes existentes
            const clientes = await this.getAll()

            // Encontrar el cliente a actualizar
            const clienteIndex = clientes.findIndex((c) => c.id === id)
            if (clienteIndex === -1) {
                throw new Error("Cliente no encontrado")
            }

            // Validar teléfono único si se está actualizando
            if (
                clienteData.telefono &&
                clienteData.telefono !== clientes[clienteIndex].telefono &&
                clientes.some((c) => c.id !== id && c.telefono === clienteData.telefono)
            ) {
                throw new Error("Ya existe otro cliente con este número de teléfono")
            }

            // Validar email si se está actualizando
            if (clienteData.email && !this.isValidEmail(clienteData.email)) {
                throw new Error("Formato de email inválido")
            }

            // Actualizar el cliente
            clientes[clienteIndex] = {
                ...clientes[clienteIndex],
                ...clienteData,
                // Asegurar que estos campos no se sobrescriban con undefined
                nombre: clienteData.nombre?.trim() || clientes[clienteIndex].nombre,
                telefono: clienteData.telefono?.trim() || clientes[clienteIndex].telefono,
                email: clienteData.email?.trim() || clientes[clienteIndex].email,
                direccion: clienteData.direccion?.trim() || clientes[clienteIndex].direccion,
            }

            // Guardar en el archivo
            await this.saveClientes(clientes)

            return clientes[clienteIndex]
        } catch (error) {
            console.error(`Error al actualizar cliente con ID ${id}:`, error)
            throw error
        }
    }

    // Eliminar un cliente
    static async delete(id: string): Promise<boolean> {
        try {
            // Crear backup antes de modificar
            await this.createBackup()

            // Obtener clientes existentes
            const clientes = await this.getAll()

            // Encontrar el cliente a eliminar
            const clienteIndex = clientes.findIndex((c) => c.id === id)
            if (clienteIndex === -1) {
                throw new Error("Cliente no encontrado")
            }

            // Eliminar el cliente
            clientes.splice(clienteIndex, 1)

            // Guardar en el archivo
            await this.saveClientes(clientes)

            return true
        } catch (error) {
            console.error(`Error al eliminar cliente con ID ${id}:`, error)
            throw error
        }
    }

    // Obtener estadísticas de clientes
    static async getStats(): Promise<{
        total: number
        nuevosUltimoMes: number
        porCategoria: Record<string, number>
    }> {
        try {
            const clientes = await this.getAll()

            // Calcular fecha de hace un mes
            const unMesAtras = new Date()
            unMesAtras.setMonth(unMesAtras.getMonth() - 1)
            const fechaUnMesAtras = unMesAtras.toISOString().split("T")[0]

            // Contar clientes nuevos en el último mes
            const nuevosUltimoMes = clientes.filter((c) => c.fechaRegistro >= fechaUnMesAtras).length

            // Contar clientes por categoría
            const porCategoria: Record<string, number> = {}
            clientes.forEach((cliente) => {
                const categoria = cliente.categoria || "Sin categoría"
                porCategoria[categoria] = (porCategoria[categoria] || 0) + 1
            })

            return {
                total: clientes.length,
                nuevosUltimoMes,
                porCategoria,
            }
        } catch (error) {
            console.error("Error al obtener estadísticas:", error)
            return {
                total: 0,
                nuevosUltimoMes: 0,
                porCategoria: {},
            }
        }
    }

    // Importar clientes desde JSON
    static async importFromJSON(jsonData: string): Promise<{ success: boolean; imported: number; errors: number }> {
        try {
            // Crear backup antes de modificar
            await this.createBackup()

            // Parsear los datos JSON
            const clientesImportar = JSON.parse(jsonData) as Omit<Cliente, "id" | "fechaRegistro">[]

            // Obtener clientes existentes
            const clientesExistentes = await this.getAll()

            // Contadores
            let imported = 0
            let errors = 0

            // Procesar cada cliente
            for (const cliente of clientesImportar) {
                try {
                    // Validar datos obligatorios
                    if (!cliente.nombre || !cliente.telefono) {
                        errors++
                        continue
                    }

                    // Verificar si ya existe un cliente con el mismo teléfono
                    if (clientesExistentes.some((c) => c.telefono === cliente.telefono)) {
                        errors++
                        continue
                    }

                    // Generar nuevo ID
                    const nuevoId = (Math.max(...clientesExistentes.map((c) => Number.parseInt(c.id))) + 1).toString()

                    // Crear nuevo cliente
                    const nuevoCliente: Cliente = {
                        id: nuevoId,
                        nombre: cliente.nombre.trim(),
                        telefono: cliente.telefono.trim(),
                        email: cliente.email?.trim(),
                        direccion: cliente.direccion?.trim(),
                        fechaRegistro: new Date().toISOString().split("T")[0],
                        categoria: cliente.categoria,
                        notas: cliente.notas,
                    }

                    // Agregar a la lista
                    clientesExistentes.push(nuevoCliente)
                    imported++
                } catch (e) {
                    errors++
                }
            }

            // Guardar en el archivo
            await this.saveClientes(clientesExistentes)

            return {
                success: true,
                imported,
                errors,
            }
        } catch (error) {
            console.error("Error al importar clientes:", error)
            throw error
        }
    }

    // Exportar todos los clientes a JSON
    static async exportToJSON(): Promise<string> {
        try {
            const clientes = await this.getAll()
            return JSON.stringify(clientes, null, 2)
        } catch (error) {
            console.error("Error al exportar clientes:", error)
            throw error
        }
    }

    // Guardar clientes en el archivo
    private static async saveClientes(clientes: Cliente[]): Promise<void> {
        try {
            await fs.writeFile(clientesFilePath, JSON.stringify(clientes, null, 2), "utf8")
        } catch (error) {
            console.error("Error al guardar clientes:", error)
            throw error
        }
    }

    // Crear un backup del archivo de clientes
    private static async createBackup(): Promise<void> {
        try {
            // Asegurar que existe el directorio de backups
            await fs.mkdir(backupDir, { recursive: true })

            // Leer el archivo actual si existe
            try {
                const fileContents = await fs.readFile(clientesFilePath, "utf8")

                // Crear nombre de archivo con timestamp
                const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
                const backupPath = path.join(backupDir, `clientes-${timestamp}.json`)

                // Guardar backup
                await fs.writeFile(backupPath, fileContents, "utf8")
            } catch (error) {
                // Si el archivo no existe, no hay nada que respaldar
                console.log("No existe archivo de clientes para respaldar")
            }
        } catch (error) {
            console.error("Error al crear backup:", error)
        }
    }

    // Validar formato de email
    private static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }
}
