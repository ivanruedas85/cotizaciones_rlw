"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Edit, Trash2, User, Phone, Mail, MapPin, Calendar, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import type { Cliente } from "@/utils/db-services"

type ClienteDetalle = Cliente & {
    estadisticas?: {
        totalCotizaciones: number
        cotizacionesAprobadas: number
        montoTotal: number
        ultimaCotizacion?: string
    }
    cotizaciones?: {
        id: string
        fecha: string
        descripcion: string
        estado: string
        total: number
    }[]
}

export default function ClienteDetallePage() {
    const params = useParams()
    const router = useRouter()
    const clienteId = params.id as string

    const [cliente, setCliente] = useState<ClienteDetalle | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Cargar datos del cliente
    const loadClienteDetalle = async () => {
        try {
            setIsLoading(true)
            setError(null)

            // Cargar información básica del cliente
            const clienteResponse = await fetch(`/api/clientes/${clienteId}`)

            if (!clienteResponse.ok) {
                if (clienteResponse.status === 404) {
                    setError("Cliente no encontrado")
                    return
                }
                throw new Error("Error al cargar cliente")
            }

            const clienteData = await clienteResponse.json()

            // Cargar cotizaciones del cliente
            const cotizacionesResponse = await fetch(`/api/cotizaciones?clienteId=${clienteId}`)
            let cotizaciones: any[] = []
            let estadisticas = {
                totalCotizaciones: 0,
                cotizacionesAprobadas: 0,
                montoTotal: 0,
                ultimaCotizacion: undefined as string | undefined,
            }

            if (cotizacionesResponse.ok) {
                cotizaciones = await cotizacionesResponse.json()

                // Calcular estadísticas
                estadisticas = {
                    totalCotizaciones: cotizaciones.length,
                    cotizacionesAprobadas: cotizaciones.filter((c) => c.estado === "aprobada" || c.estado === "completada")
                        .length,
                    montoTotal: cotizaciones
                        .filter((c) => c.estado === "aprobada" || c.estado === "completada")
                        .reduce((sum, c) => sum + c.total, 0),
                    ultimaCotizacion: cotizaciones.length > 0 ? cotizaciones[0].fecha : undefined,
                }
            }

            setCliente({
                ...clienteData,
                estadisticas,
                cotizaciones: cotizaciones.slice(0, 10), // Mostrar solo las últimas 10
            })
        } catch (error) {
            console.error("Error:", error)
            setError("Error al cargar los datos del cliente")
        } finally {
            setIsLoading(false)
        }
    }

    // Eliminar cliente
    const handleDelete = async () => {
        if (!cliente) return

        const confirmMessage = `¿Está seguro que desea eliminar al cliente "${cliente.nombre}"?`
        if (cliente.estadisticas && cliente.estadisticas.totalCotizaciones > 0) {
            const cotizacionesMessage = `\n\nEste cliente tiene ${cliente.estadisticas.totalCotizaciones} cotizaciones asociadas. Al eliminarlo, se perderá esta información.`
            if (!confirm(confirmMessage + cotizacionesMessage)) return
        } else {
            if (!confirm(confirmMessage)) return
        }

        try {
            setIsDeleting(true)

            const response = await fetch(`/api/clientes/${clienteId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Error al eliminar cliente")
            }

            // Redirigir a la lista de clientes
            router.push("/clientes")
        } catch (error) {
            console.error("Error:", error)
            alert(error instanceof Error ? error.message : "Error desconocido al eliminar cliente")
        } finally {
            setIsDeleting(false)
        }
    }

    // Cargar datos al montar el componente
    useEffect(() => {
        loadClienteDetalle()
    }, [clienteId])

    if (isLoading) {
        return (
            <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-background">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">Cargando información del cliente...</span>
                    </div>
                </div>
            </main>
        )
    }

    if (error || !cliente) {
        return (
            <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-background">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                        <Link href="/clientes">
                            <Button variant="outline" className="flex items-center">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver a Clientes
                            </Button>
                        </Link>
                    </div>
                    <Alert variant="destructive">
                        <AlertDescription>{error || "Cliente no encontrado"}</AlertDescription>
                    </Alert>
                </div>
            </main>
        )
    }

    const getEstadoBadgeVariant = (estado: string) => {
        switch (estado) {
            case "aprobada":
            case "completada":
                return "default"
            case "pendiente":
                return "secondary"
            case "en_proceso":
                return "outline"
            case "rechazada":
            case "cancelada":
                return "destructive"
            default:
                return "secondary"
        }
    }

    return (
        <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-background">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <Link href="/clientes">
                        <Button variant="outline" className="flex items-center">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver a Clientes
                        </Button>
                    </Link>
                    <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                        <Link href={`/clientes/editar/${clienteId}`}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Editar Cliente
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Eliminando...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar Cliente
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Información básica del cliente */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="mr-2 h-5 w-5" />
                                Información del Cliente
                            </CardTitle>
                            <CardDescription>Datos de contacto y registro</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold">{cliente.nombre}</h3>
                                        <p className="text-muted-foreground">ID: {cliente.id}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <span>{cliente.telefono}</span>
                                        </div>

                                        {cliente.email && (
                                            <div className="flex items-center">
                                                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                                <span>{cliente.email}</span>
                                            </div>
                                        )}

                                        {cliente.direccion && (
                                            <div className="flex items-center">
                                                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                                <span>{cliente.direccion}</span>
                                            </div>
                                        )}

                                        {cliente.fechaRegistro && (
                                            <div className="flex items-center">
                                                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                                <span>Registrado el {new Date(cliente.fechaRegistro).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Estadísticas del cliente */}
                                {cliente.estadisticas && (
                                    <div className="space-y-4">
                                        <h4 className="font-medium">Estadísticas</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Card>
                                                <CardContent className="pt-6">
                                                    <div className="text-2xl font-bold">{cliente.estadisticas.totalCotizaciones}</div>
                                                    <p className="text-xs text-muted-foreground">Total Cotizaciones</p>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardContent className="pt-6">
                                                    <div className="text-2xl font-bold text-green-600">
                                                        {cliente.estadisticas.cotizacionesAprobadas}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Aprobadas</p>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardContent className="pt-6">
                                                    <div className="text-2xl font-bold">${cliente.estadisticas.montoTotal.toFixed(2)}</div>
                                                    <p className="text-xs text-muted-foreground">Monto Total</p>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardContent className="pt-6">
                                                    <div className="text-2xl font-bold">
                                                        {cliente.estadisticas.cotizacionesAprobadas > 0
                                                            ? `$${(cliente.estadisticas.montoTotal / cliente.estadisticas.cotizacionesAprobadas).toFixed(2)}`
                                                            : "$0.00"}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Promedio por Venta</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Historial de cotizaciones */}
                    {cliente.cotizaciones && cliente.cotizaciones.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="mr-2 h-5 w-5" />
                                    Historial de Cotizaciones
                                </CardTitle>
                                <CardDescription>
                                    Últimas cotizaciones del cliente ({cliente.cotizaciones.length} de{" "}
                                    {cliente.estadisticas?.totalCotizaciones || 0})
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Descripción</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {cliente.cotizaciones.map((cotizacion) => (
                                            <TableRow key={cotizacion.id}>
                                                <TableCell className="font-medium">{cotizacion.id}</TableCell>
                                                <TableCell>{new Date(cotizacion.fecha).toLocaleDateString()}</TableCell>
                                                <TableCell>{cotizacion.descripcion}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getEstadoBadgeVariant(cotizacion.estado)}>
                                                        {cotizacion.estado.charAt(0).toUpperCase() + cotizacion.estado.slice(1).replace("_", " ")}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">${cotizacion.total.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`/cotizaciones/${cotizacion.id}`}>
                                                        <Button variant="ghost" size="icon">
                                                            <FileText className="h-4 w-4" />
                                                            <span className="sr-only">Ver cotización</span>
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {cliente.estadisticas && cliente.estadisticas.totalCotizaciones > 10 && (
                                    <div className="mt-4 text-center">
                                        <Link href={`/cotizaciones?clienteId=${clienteId}`}>
                                            <Button variant="outline">Ver todas las cotizaciones</Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Mensaje si no hay cotizaciones */}
                    {cliente.cotizaciones && cliente.cotizaciones.length === 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="mr-2 h-5 w-5" />
                                    Historial de Cotizaciones
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Este cliente aún no tiene cotizaciones registradas.</p>
                                    <Link href="/" className="mt-4 inline-block">
                                        <Button>Crear primera cotización</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </main>
    )
}
