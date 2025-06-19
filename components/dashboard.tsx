"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    FileText,
    Users,
    Download,
    BarChart3,
    PieChart,
    Target,
    Loader2,
} from "lucide-react"
// Remover: import cotizacionesData from "@/data/cotizaciones.json"

// Tipos
type Quotation = {
    id: string
    fecha: string
    estado: string
    clienteId: string
    cliente: {
        nombre: string
        telefono: string
    }
    descripcion: string
    total: number
}

type DashboardMetrics = {
    totalCotizaciones: number
    totalVentas: number
    tasaConversion: number
    ventasCompletadas: number
    ventasPendientes: number
    clientesActivos: number
    promedioVenta: number
    crecimientoMensual: number
}

type EstadisticasPorEstado = {
    [key: string]: {
        cantidad: number
        valor: number
        porcentaje: number
    }
}

export function Dashboard() {
    const [fechaInicio, setFechaInicio] = useState("")
    const [fechaFin, setFechaFin] = useState("")
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState("todos")
    // Agregar estado para cotizaciones
    const [cotizacionesData, setCotizacionesData] = useState<Quotation[]>([])
    const [isLoadingData, setIsLoadingData] = useState(true)

    // Cargar cotizaciones desde la API
    useEffect(() => {
        const loadCotizaciones = async () => {
            try {
                setIsLoadingData(true)
                const response = await fetch("/api/cotizaciones")
                if (response.ok) {
                    const data: Quotation[] = await response.json()
                    setCotizacionesData(data)
                }
            } catch (error) {
                console.error("Error al cargar cotizaciones:", error)
            } finally {
                setIsLoadingData(false)
            }
        }

        loadCotizaciones()
    }, [])

    // Filtrar cotizaciones por fecha
    const cotizacionesFiltradas = useMemo(() => {
        let filtered = cotizacionesData as Quotation[]

        if (periodoSeleccionado !== "todos") {
            const hoy = new Date()
            const fechaLimite = new Date()

            switch (periodoSeleccionado) {
                case "7dias":
                    fechaLimite.setDate(hoy.getDate() - 7)
                    break
                case "30dias":
                    fechaLimite.setDate(hoy.getDate() - 30)
                    break
                case "90dias":
                    fechaLimite.setDate(hoy.getDate() - 90)
                    break
                case "año":
                    fechaLimite.setFullYear(hoy.getFullYear() - 1)
                    break
            }

            filtered = filtered.filter((cotizacion) => new Date(cotizacion.fecha) >= fechaLimite)
        }

        if (fechaInicio && fechaFin) {
            filtered = filtered.filter((cotizacion) => {
                const fecha = new Date(cotizacion.fecha)
                return fecha >= new Date(fechaInicio) && fecha <= new Date(fechaFin)
            })
        }

        return filtered
    }, [periodoSeleccionado, fechaInicio, fechaFin, cotizacionesData])

    // Calcular métricas
    const metricas = useMemo((): DashboardMetrics => {
        const totalCotizaciones = cotizacionesFiltradas.length
        const ventasCompletadas = cotizacionesFiltradas.filter((c) => c.estado === "Completada").length
        const ventasAprobadas = cotizacionesFiltradas.filter((c) => c.estado === "Aprobada").length
        const ventasPendientes = cotizacionesFiltradas.filter((c) => c.estado === "Pendiente").length

        const totalVentas = cotizacionesFiltradas
            .filter((c) => c.estado === "Completada" || c.estado === "Aprobada")
            .reduce((sum, c) => sum + c.total, 0)

        const tasaConversion = totalCotizaciones > 0 ? ((ventasCompletadas + ventasAprobadas) / totalCotizaciones) * 100 : 0

        const clientesUnicos = new Set(cotizacionesFiltradas.map((c) => c.clienteId)).size

        const promedioVenta =
            ventasCompletadas + ventasAprobadas > 0 ? totalVentas / (ventasCompletadas + ventasAprobadas) : 0

        // Calcular crecimiento mensual (simulado)
        const mesAnterior = cotizacionesData.filter((c) => {
            const fecha = new Date(c.fecha)
            const hoy = new Date()
            const mesAnteriorFecha = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
            const mesAnteriorFin = new Date(hoy.getFullYear(), hoy.getMonth(), 0)
            return fecha >= mesAnteriorFecha && fecha <= mesAnteriorFin
        })

        const ventasMesAnterior = mesAnterior
            .filter((c) => c.estado === "Completada" || c.estado === "Aprobada")
            .reduce((sum, c) => sum + c.total, 0)

        const crecimientoMensual = ventasMesAnterior > 0 ? ((totalVentas - ventasMesAnterior) / ventasMesAnterior) * 100 : 0

        return {
            totalCotizaciones,
            totalVentas,
            tasaConversion,
            ventasCompletadas,
            ventasPendientes,
            clientesActivos: clientesUnicos,
            promedioVenta,
            crecimientoMensual,
        }
    }, [cotizacionesFiltradas, cotizacionesData])

    // Estadísticas por estado
    const estadisticasPorEstado = useMemo((): EstadisticasPorEstado => {
        const estados = ["Pendiente", "Aprobada", "Rechazada", "En proceso", "Completada", "Cancelada"]
        const total = cotizacionesFiltradas.length

        return estados.reduce((acc, estado) => {
            const cotizacionesEstado = cotizacionesFiltradas.filter((c) => c.estado === estado)
            const cantidad = cotizacionesEstado.length
            const valor = cotizacionesEstado.reduce((sum, c) => sum + c.total, 0)
            const porcentaje = total > 0 ? (cantidad / total) * 100 : 0

            acc[estado] = { cantidad, valor, porcentaje }
            return acc
        }, {} as EstadisticasPorEstado)
    }, [cotizacionesFiltradas])

    // Top clientes
    const topClientes = useMemo(() => {
        const clientesVentas = cotizacionesFiltradas
            .filter((c) => c.estado === "Completada" || c.estado === "Aprobada")
            .reduce(
                (acc, cotizacion) => {
                    const clienteId = cotizacion.clienteId
                    if (!acc[clienteId]) {
                        acc[clienteId] = {
                            nombre: cotizacion.cliente.nombre,
                            telefono: cotizacion.cliente.telefono,
                            totalVentas: 0,
                            cantidadCotizaciones: 0,
                        }
                    }
                    acc[clienteId].totalVentas += cotizacion.total
                    acc[clienteId].cantidadCotizaciones += 1
                    return acc
                },
                {} as Record<string, any>,
            )

        return Object.values(clientesVentas)
            .sort((a: any, b: any) => b.totalVentas - a.totalVentas)
            .slice(0, 5)
    }, [cotizacionesFiltradas])

    // Indicador de carga
    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Cargando datos del dashboard...</span>
            </div>
        )
    }

    // Función para exportar reporte
    const exportarReporte = () => {
        const reporte = {
            periodo: periodoSeleccionado,
            fechaInicio,
            fechaFin,
            metricas,
            estadisticasPorEstado,
            topClientes,
            cotizaciones: cotizacionesFiltradas,
        }

        const dataStr = JSON.stringify(reporte, null, 2)
        const dataBlob = new Blob([dataStr], { type: "application/json" })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `reporte-ventas-${new Date().toISOString().split("T")[0]}.json`
        link.click()
        URL.revokeObjectURL(url)
    }

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case "Pendiente":
                return "bg-yellow-100 text-yellow-800"
            case "Aprobada":
                return "bg-green-100 text-green-800"
            case "Rechazada":
                return "bg-red-100 text-red-800"
            case "En proceso":
                return "bg-blue-100 text-blue-800"
            case "Completada":
                return "bg-emerald-100 text-emerald-800"
            case "Cancelada":
                return "bg-gray-100 text-gray-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Dashboard de Ventas y Reportes
                    </CardTitle>
                    <CardDescription>Analice el rendimiento de sus cotizaciones y ventas</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Período</Label>
                            <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos los tiempos</SelectItem>
                                    <SelectItem value="7dias">Últimos 7 días</SelectItem>
                                    <SelectItem value="30dias">Últimos 30 días</SelectItem>
                                    <SelectItem value="90dias">Últimos 90 días</SelectItem>
                                    <SelectItem value="año">Último año</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Fecha Inicio</Label>
                            <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Fecha Fin</Label>
                            <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Acciones</Label>
                            <Button onClick={exportarReporte} className="w-full">
                                <Download className="mr-2 h-4 w-4" />
                                Exportar Reporte
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${metricas.totalVentas.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            {metricas.crecimientoMensual >= 0 ? (
                                <span className="text-green-600 flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1" />+{metricas.crecimientoMensual.toFixed(1)}% vs mes anterior
                                </span>
                            ) : (
                                <span className="text-red-600 flex items-center">
                                    <TrendingDown className="h-3 w-3 mr-1" />
                                    {metricas.crecimientoMensual.toFixed(1)}% vs mes anterior
                                </span>
                            )}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cotizaciones</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metricas.totalCotizaciones}</div>
                        <p className="text-xs text-muted-foreground">{metricas.ventasPendientes} pendientes</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metricas.tasaConversion.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">{metricas.ventasCompletadas} completadas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metricas.clientesActivos}</div>
                        <p className="text-xs text-muted-foreground">Promedio: ${metricas.promedioVenta.toFixed(2)} por venta</p>
                    </CardContent>
                </Card>
            </div>

            {/* Gráficos y estadísticas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribución por estado */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <PieChart className="mr-2 h-5 w-5" />
                            Distribución por Estado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(estadisticasPorEstado).map(([estado, stats]) => (
                                <div key={estado} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Badge className={getEstadoColor(estado)}>{estado}</Badge>
                                        <span className="text-sm">{stats.cantidad}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stats.porcentaje}%` }} />
                                        </div>
                                        <span className="text-sm font-medium">{stats.porcentaje.toFixed(1)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top clientes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top 5 Clientes</CardTitle>
                        <CardDescription>Clientes con mayores ventas en el período</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topClientes.map((cliente: any, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{cliente.nombre}</div>
                                        <div className="text-sm text-muted-foreground">{cliente.cantidadCotizaciones} cotizaciones</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">${cliente.totalVentas.toFixed(2)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabla de cotizaciones recientes */}
            <Card>
                <CardHeader>
                    <CardTitle>Cotizaciones del Período</CardTitle>
                    <CardDescription>Mostrando {cotizacionesFiltradas.length} cotizaciones</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cotizacionesFiltradas.slice(0, 10).map((cotizacion) => (
                                <TableRow key={cotizacion.id}>
                                    <TableCell className="font-medium">{cotizacion.id}</TableCell>
                                    <TableCell>{new Date(cotizacion.fecha).toLocaleDateString()}</TableCell>
                                    <TableCell>{cotizacion.cliente.nombre}</TableCell>
                                    <TableCell>
                                        <Badge className={getEstadoColor(cotizacion.estado)}>{cotizacion.estado}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">${cotizacion.total.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
