import { promises as fs } from "fs"
import path from "path"

// Tipos para las cotizaciones
export type EstadoCotizacion = "pendiente" | "aprobada" | "rechazada" | "en_proceso" | "completada" | "cancelada"

export type Cotizacion = {
    id: string
    fecha: string
    clienteId: string
    cliente: {
        nombre: string
        telefono: string
        email?: string
    }
    descripcion: string
    estado: EstadoCotizacion
    fechaVencimiento?: string
    fechaAprobacion?: string
    fechaCompletado?: string
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
    notas?: string
    descuento?: number
    impuestos?: number
    metodoPago?: string
    condicionesPago?: string
    validezDias?: number
}

// Tipos para reportes
export type ReporteVentas = {
    periodo: string
    totalCotizaciones: number
    cotizacionesAprobadas: number
    cotizacionesRechazadas: number
    cotizacionesPendientes: number
    ventaTotal: number
    ventaPromedio: number
    clientesMasActivos: { clienteId: string; nombre: string; totalCotizaciones: number; montoTotal: number }[]
    insumosMasUsados: { insumoId: string; nombre: string; cantidadUsada: number; montoTotal: number }[]
    ventasPorMes: { mes: string; ventas: number; cotizaciones: number }[]
}

// Rutas de los archivos JSON
const cotizacionesFilePath = path.join(process.cwd(), "data", "cotizaciones.json")
const backupDir = path.join(process.cwd(), "data", "backups")

// Clase para gestionar la base de datos de cotizaciones
export class CotizacionDB {
    // Obtener todas las cotizaciones
    static async getAll(): Promise<Cotizacion[]> {
        try {
            const fileContents = await fs.readFile(cotizacionesFilePath, "utf8")
            return JSON.parse(fileContents)
        } catch (error) {
            console.error("Error al leer cotizaciones:", error)
            return []
        }
    }

    // Obtener una cotización por ID
    static async getById(id: string): Promise<Cotizacion | null> {
        try {
            const cotizaciones = await this.getAll()
            return cotizaciones.find((c) => c.id === id) || null
        } catch (error) {
            console.error(`Error al obtener cotización con ID ${id}:`, error)
            return null
        }
    }

    // Buscar cotizaciones por criterios
    static async search(criteria: {
        clienteId?: string
        estado?: EstadoCotizacion
        fechaDesde?: string
        fechaHasta?: string
        montoMinimo?: number
        montoMaximo?: string
        descripcion?: string
    }): Promise<Cotizacion[]> {
        try {
            const cotizaciones = await this.getAll()

            return cotizaciones.filter((cotizacion) => {
                let match = true

                if (criteria.clienteId && cotizacion.clienteId !== criteria.clienteId) {
                    match = false
                }

                if (criteria.estado && cotizacion.estado !== criteria.estado) {
                    match = false
                }

                if (criteria.fechaDesde && cotizacion.fecha < criteria.fechaDesde) {
                    match = false
                }

                if (criteria.fechaHasta && cotizacion.fecha > criteria.fechaHasta) {
                    match = false
                }

                if (criteria.montoMinimo && cotizacion.total < criteria.montoMinimo) {
                    match = false
                }

                if (criteria.montoMaximo && cotizacion.total > Number.parseFloat(criteria.montoMaximo)) {
                    match = false
                }

                if (
                    criteria.descripcion &&
                    !cotizacion.descripcion.toLowerCase().includes(criteria.descripcion.toLowerCase())
                ) {
                    match = false
                }

                return match
            })
        } catch (error) {
            console.error("Error al buscar cotizaciones:", error)
            return []
        }
    }

    // Crear una nueva cotización
    static async create(cotizacion: Omit<Cotizacion, "id" | "fecha">): Promise<Cotizacion | null> {
        try {
            // Crear backup antes de modificar
            await this.createBackup()

            // Validar datos obligatorios
            if (!cotizacion.clienteId || !cotizacion.descripcion) {
                throw new Error("Cliente y descripción son obligatorios")
            }

            // Obtener cotizaciones existentes
            const cotizaciones = await this.getAll()

            // Generar nuevo ID
            const nuevoId = `COT-${String(cotizaciones.length + 1).padStart(3, "0")}`

            // Calcular fecha de vencimiento si no se proporciona
            const fechaActual = new Date()
            const validezDias = cotizacion.validezDias || 15
            const fechaVencimiento = new Date(fechaActual.getTime() + validezDias * 24 * 60 * 60 * 1000)

            // Crear nueva cotización
            const nuevaCotizacion: Cotizacion = {
                id: nuevoId,
                fecha: fechaActual.toISOString().split("T")[0],
                fechaVencimiento: fechaVencimiento.toISOString().split("T")[0],
                estado: "pendiente",
                validezDias: validezDias,
                ...cotizacion,
            }

            // Agregar la nueva cotización
            cotizaciones.push(nuevaCotizacion)

            // Guardar en el archivo
            await this.saveCotizaciones(cotizaciones)

            return nuevaCotizacion
        } catch (error) {
            console.error("Error al crear cotización:", error)
            throw error
        }
    }

    // Actualizar una cotización existente
    static async update(id: string, cotizacionData: Partial<Cotizacion>): Promise<Cotizacion | null> {
        try {
            // Crear backup antes de modificar
            await this.createBackup()

            // Obtener cotizaciones existentes
            const cotizaciones = await this.getAll()

            // Encontrar la cotización a actualizar
            const cotizacionIndex = cotizaciones.findIndex((c) => c.id === id)
            if (cotizacionIndex === -1) {
                throw new Error("Cotización no encontrada")
            }

            // Actualizar fechas según el estado
            if (cotizacionData.estado) {
                const fechaActual = new Date().toISOString().split("T")[0]

                if (cotizacionData.estado === "aprobada" && !cotizaciones[cotizacionIndex].fechaAprobacion) {
                    cotizacionData.fechaAprobacion = fechaActual
                }

                if (cotizacionData.estado === "completada" && !cotizaciones[cotizacionIndex].fechaCompletado) {
                    cotizacionData.fechaCompletado = fechaActual
                }
            }

            // Actualizar la cotización
            cotizaciones[cotizacionIndex] = {
                ...cotizaciones[cotizacionIndex],
                ...cotizacionData,
            }

            // Guardar en el archivo
            await this.saveCotizaciones(cotizaciones)

            return cotizaciones[cotizacionIndex]
        } catch (error) {
            console.error(`Error al actualizar cotización con ID ${id}:`, error)
            throw error
        }
    }

    // Eliminar una cotización
    static async delete(id: string): Promise<boolean> {
        try {
            // Crear backup antes de modificar
            await this.createBackup()

            // Obtener cotizaciones existentes
            const cotizaciones = await this.getAll()

            // Encontrar la cotización a eliminar
            const cotizacionIndex = cotizaciones.findIndex((c) => c.id === id)
            if (cotizacionIndex === -1) {
                throw new Error("Cotización no encontrada")
            }

            // Eliminar la cotización
            cotizaciones.splice(cotizacionIndex, 1)

            // Guardar en el archivo
            await this.saveCotizaciones(cotizaciones)

            return true
        } catch (error) {
            console.error(`Error al eliminar cotización con ID ${id}:`, error)
            throw error
        }
    }

    // Obtener estadísticas generales
    static async getStats(): Promise<{
        total: number
        porEstado: Record<EstadoCotizacion, number>
        ventaTotal: number
        ventaPromedio: number
        cotizacionesVencidas: number
        cotizacionesDelMes: number
    }> {
        try {
            const cotizaciones = await this.getAll()
            const fechaActual = new Date()
            const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1)

            // Contar por estado
            const porEstado: Record<EstadoCotizacion, number> = {
                pendiente: 0,
                aprobada: 0,
                rechazada: 0,
                en_proceso: 0,
                completada: 0,
                cancelada: 0,
            }

            let ventaTotal = 0
            let cotizacionesVencidas = 0
            let cotizacionesDelMes = 0

            cotizaciones.forEach((cotizacion) => {
                // Contar por estado
                porEstado[cotizacion.estado]++

                // Calcular venta total (solo cotizaciones aprobadas y completadas)
                if (cotizacion.estado === "aprobada" || cotizacion.estado === "completada") {
                    ventaTotal += cotizacion.total
                }

                // Contar cotizaciones vencidas
                if (
                    cotizacion.fechaVencimiento &&
                    new Date(cotizacion.fechaVencimiento) < fechaActual &&
                    cotizacion.estado === "pendiente"
                ) {
                    cotizacionesVencidas++
                }

                // Contar cotizaciones del mes actual
                if (new Date(cotizacion.fecha) >= inicioMes) {
                    cotizacionesDelMes++
                }
            })

            const ventaPromedio = cotizaciones.length > 0 ? ventaTotal / cotizaciones.length : 0

            return {
                total: cotizaciones.length,
                porEstado,
                ventaTotal,
                ventaPromedio,
                cotizacionesVencidas,
                cotizacionesDelMes,
            }
        } catch (error) {
            console.error("Error al obtener estadísticas:", error)
            return {
                total: 0,
                porEstado: {
                    pendiente: 0,
                    aprobada: 0,
                    rechazada: 0,
                    en_proceso: 0,
                    completada: 0,
                    cancelada: 0,
                },
                ventaTotal: 0,
                ventaPromedio: 0,
                cotizacionesVencidas: 0,
                cotizacionesDelMes: 0,
            }
        }
    }

    // Generar reporte de ventas
    static async generateSalesReport(fechaInicio: string, fechaFin: string): Promise<ReporteVentas> {
        try {
            const cotizaciones = await this.getAll()

            // Filtrar cotizaciones por rango de fechas
            const cotizacionesFiltradas = cotizaciones.filter((c) => c.fecha >= fechaInicio && c.fecha <= fechaFin)

            // Estadísticas básicas
            const totalCotizaciones = cotizacionesFiltradas.length
            const cotizacionesAprobadas = cotizacionesFiltradas.filter(
                (c) => c.estado === "aprobada" || c.estado === "completada",
            ).length
            const cotizacionesRechazadas = cotizacionesFiltradas.filter((c) => c.estado === "rechazada").length
            const cotizacionesPendientes = cotizacionesFiltradas.filter((c) => c.estado === "pendiente").length

            // Calcular venta total
            const ventaTotal = cotizacionesFiltradas
                .filter((c) => c.estado === "aprobada" || c.estado === "completada")
                .reduce((sum, c) => sum + c.total, 0)

            const ventaPromedio = cotizacionesAprobadas > 0 ? ventaTotal / cotizacionesAprobadas : 0

            // Clientes más activos
            const clientesMap = new Map<string, { nombre: string; totalCotizaciones: number; montoTotal: number }>()

            cotizacionesFiltradas.forEach((cotizacion) => {
                const clienteId = cotizacion.clienteId
                const existing = clientesMap.get(clienteId) || {
                    nombre: cotizacion.cliente.nombre,
                    totalCotizaciones: 0,
                    montoTotal: 0,
                }

                existing.totalCotizaciones++
                if (cotizacion.estado === "aprobada" || cotizacion.estado === "completada") {
                    existing.montoTotal += cotizacion.total
                }

                clientesMap.set(clienteId, existing)
            })

            const clientesMasActivos = Array.from(clientesMap.entries())
                .map(([clienteId, data]) => ({ clienteId, ...data }))
                .sort((a, b) => b.montoTotal - a.montoTotal)
                .slice(0, 10)

            // Insumos más usados
            const insumosMap = new Map<string, { nombre: string; cantidadUsada: number; montoTotal: number }>()

            cotizacionesFiltradas.forEach((cotizacion) => {
                cotizacion.insumos.forEach((insumo) => {
                    const existing = insumosMap.get(insumo.id) || {
                        nombre: insumo.nombre,
                        cantidadUsada: 0,
                        montoTotal: 0,
                    }

                    existing.cantidadUsada += insumo.cantidad
                    existing.montoTotal += insumo.cantidad * insumo.precioUnitario

                    insumosMap.set(insumo.id, existing)
                })
            })

            const insumosMasUsados = Array.from(insumosMap.entries())
                .map(([insumoId, data]) => ({ insumoId, ...data }))
                .sort((a, b) => b.montoTotal - a.montoTotal)
                .slice(0, 10)

            // Ventas por mes
            const ventasPorMesMap = new Map<string, { ventas: number; cotizaciones: number }>()

            cotizacionesFiltradas.forEach((cotizacion) => {
                const mes = cotizacion.fecha.substring(0, 7) // YYYY-MM
                const existing = ventasPorMesMap.get(mes) || { ventas: 0, cotizaciones: 0 }

                existing.cotizaciones++
                if (cotizacion.estado === "aprobada" || cotizacion.estado === "completada") {
                    existing.ventas += cotizacion.total
                }

                ventasPorMesMap.set(mes, existing)
            })

            const ventasPorMes = Array.from(ventasPorMesMap.entries())
                .map(([mes, data]) => ({ mes, ...data }))
                .sort((a, b) => a.mes.localeCompare(b.mes))

            return {
                periodo: `${fechaInicio} - ${fechaFin}`,
                totalCotizaciones,
                cotizacionesAprobadas,
                cotizacionesRechazadas,
                cotizacionesPendientes,
                ventaTotal,
                ventaPromedio,
                clientesMasActivos,
                insumosMasUsados,
                ventasPorMes,
            }
        } catch (error) {
            console.error("Error al generar reporte de ventas:", error)
            throw error
        }
    }

    // Exportar cotizaciones a JSON
    static async exportToJSON(filtros?: {
        fechaInicio?: string
        fechaFin?: string
        estado?: EstadoCotizacion
    }): Promise<string> {
        try {
            let cotizaciones = await this.getAll()

            // Aplicar filtros si se proporcionan
            if (filtros) {
                if (filtros.fechaInicio) {
                    cotizaciones = cotizaciones.filter((c) => c.fecha >= filtros.fechaInicio!)
                }
                if (filtros.fechaFin) {
                    cotizaciones = cotizaciones.filter((c) => c.fecha <= filtros.fechaFin!)
                }
                if (filtros.estado) {
                    cotizaciones = cotizaciones.filter((c) => c.estado === filtros.estado)
                }
            }

            return JSON.stringify(cotizaciones, null, 2)
        } catch (error) {
            console.error("Error al exportar cotizaciones:", error)
            throw error
        }
    }

    // Obtener cotizaciones próximas a vencer
    static async getCotizacionesProximasVencer(dias = 7): Promise<Cotizacion[]> {
        try {
            const cotizaciones = await this.getAll()
            const fechaLimite = new Date()
            fechaLimite.setDate(fechaLimite.getDate() + dias)

            return cotizaciones.filter((cotizacion) => {
                if (cotizacion.estado !== "pendiente" || !cotizacion.fechaVencimiento) {
                    return false
                }

                const fechaVencimiento = new Date(cotizacion.fechaVencimiento)
                return fechaVencimiento <= fechaLimite && fechaVencimiento >= new Date()
            })
        } catch (error) {
            console.error("Error al obtener cotizaciones próximas a vencer:", error)
            return []
        }
    }

    // Guardar cotizaciones en el archivo
    private static async saveCotizaciones(cotizaciones: Cotizacion[]): Promise<void> {
        try {
            await fs.writeFile(cotizacionesFilePath, JSON.stringify(cotizaciones, null, 2), "utf8")
        } catch (error) {
            console.error("Error al guardar cotizaciones:", error)
            throw error
        }
    }

    // Crear un backup del archivo de cotizaciones
    private static async createBackup(): Promise<void> {
        try {
            // Asegurar que existe el directorio de backups
            await fs.mkdir(backupDir, { recursive: true })

            // Leer el archivo actual si existe
            try {
                const fileContents = await fs.readFile(cotizacionesFilePath, "utf8")

                // Crear nombre de archivo con timestamp
                const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
                const backupPath = path.join(backupDir, `cotizaciones-${timestamp}.json`)

                // Guardar backup
                await fs.writeFile(backupPath, fileContents, "utf8")
            } catch (error) {
                // Si el archivo no existe, no hay nada que respaldar
                console.log("No existe archivo de cotizaciones para respaldar")
            }
        } catch (error) {
            console.error("Error al crear backup:", error)
        }
    }
}
