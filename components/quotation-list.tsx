"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, Edit, Trash2, User, Phone, Download, Filter, Loader2 } from "lucide-react"
import Link from "next/link"
import { viewQuotationPDF, downloadQuotationPDF } from "@/utils/pdf-generator"

// Tipo para las cotizaciones
export type Quotation = {
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

// Estados disponibles
const ESTADOS_COTIZACION = ["Pendiente", "Aprobada", "Rechazada", "En proceso", "Completada", "Cancelada"]

// Función para obtener el color del badge según el estado
const getEstadoBadgeVariant = (estado: string) => {
  switch (estado) {
    case "Pendiente":
      return "secondary"
    case "Aprobada":
      return "default"
    case "Rechazada":
      return "destructive"
    case "En proceso":
      return "outline"
    case "Completada":
      return "default"
    case "Cancelada":
      return "destructive"
    default:
      return "secondary"
  }
}

// Función para obtener el color del badge según el estado
const getEstadoBadgeColor = (estado: string) => {
  switch (estado) {
    case "Pendiente":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    case "Aprobada":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "Rechazada":
      return "bg-red-100 text-red-800 hover:bg-red-200"
    case "En proceso":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case "Completada":
      return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
    case "Cancelada":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }
}

export function QuotationList() {
  // Remover: import cotizacionesData from "@/data/cotizaciones.json"

  // Agregar estados
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEstado, setSelectedEstado] = useState<string>("todos")

  // Función para cargar cotizaciones desde la API
  const loadQuotations = async () => {
    try {
      setIsLoadingData(true)
      const response = await fetch("/api/cotizaciones")
      if (response.ok) {
        const data = await response.json()
        setQuotations(data)
      }
    } catch (error) {
      console.error("Error al cargar cotizaciones:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  // Cargar cotizaciones al montar el componente
  useEffect(() => {
    loadQuotations()
  }, [])

  // Filtrar cotizaciones según el término de búsqueda y estado
  const filteredQuotations = quotations.filter((quotation) => {
    const matchesSearch =
      quotation.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.cliente.telefono.includes(searchTerm)

    const matchesEstado = selectedEstado === "todos" || quotation.estado === selectedEstado

    return matchesSearch && matchesEstado
  })

  // Función para eliminar una cotización
  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro que desea eliminar esta cotización?")) {
      try {
        const response = await fetch(`/api/cotizaciones/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setQuotations(quotations.filter((q) => q.id !== id))
        }
      } catch (error) {
        console.error("Error al eliminar cotización:", error)
      }
    }
  }

  // Función para cambiar el estado de una cotización
  const handleEstadoChange = async (quotationId: string, newEstado: string) => {
    try {
      const response = await fetch(`/api/cotizaciones/${quotationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: newEstado }),
      })

      if (response.ok) {
        // Actualizar el estado local
        setQuotations(quotations.map((q) => (q.id === quotationId ? { ...q, estado: newEstado } : q)))
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error)
    }
  }

  // Función para ver el PDF en el navegador
  const handleViewPDF = (quotation: Quotation) => {
    viewQuotationPDF(quotation)
  }

  // Función para descargar el PDF
  const handleDownloadPDF = (quotation: Quotation) => {
    downloadQuotationPDF(quotation)
  }

  // Contar cotizaciones por estado
  const estadisticas = ESTADOS_COTIZACION.reduce(
    (acc, estado) => {
      acc[estado] = quotations.filter((q) => q.estado === estado).length
      return acc
    },
    {} as Record<string, number>,
  )

  if (isLoadingData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Cargando cotizaciones...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {ESTADOS_COTIZACION.map((estado) => (
          <Card key={estado} className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{estadisticas[estado] || 0}</div>
              <div className="text-sm text-gray-500">{estado}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cotizaciones Recientes</CardTitle>
          <CardDescription>Gestione sus cotizaciones y genere reportes</CardDescription>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar por cliente, descripción, teléfono o ID..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={selectedEstado} onValueChange={setSelectedEstado}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  {ESTADOS_COTIZACION.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotations.length > 0 ? (
                filteredQuotations.map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell className="font-medium">{quotation.id}</TableCell>
                    <TableCell>{new Date(quotation.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        {quotation.cliente.nombre}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        {quotation.cliente.telefono}
                      </div>
                    </TableCell>
                    <TableCell>{quotation.descripcion}</TableCell>
                    <TableCell>
                      <Select
                        value={quotation.estado}
                        onValueChange={(newEstado) => handleEstadoChange(quotation.id, newEstado)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <Badge className={getEstadoBadgeColor(quotation.estado)}>{quotation.estado}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADOS_COTIZACION.map((estado) => (
                            <SelectItem key={estado} value={estado}>
                              <Badge className={getEstadoBadgeColor(estado)}>{estado}</Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right font-medium">${quotation.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewPDF(quotation)} title="Ver PDF">
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Ver PDF</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadPDF(quotation)}
                          title="Descargar PDF"
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Descargar PDF</span>
                        </Button>
                        <Link href="/">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(quotation.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                    {selectedEstado !== "todos"
                      ? `No se encontraron cotizaciones con estado "${selectedEstado}"`
                      : "No se encontraron cotizaciones"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
