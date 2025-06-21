"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PlusCircle, Package, ArrowUpDown, Search, Edit, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"

// Tipo para los insumos
type Insumo = {
  id: string
  nombre: string
  precio_volumen: number
  cantidad_volumen: number
  precio_unidad: number
  descripcion: string
}

export default function InsumosPage() {
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<keyof Insumo>("nombre")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Cargar insumos desde la API
  const loadInsumos = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/insumos")

      if (!response.ok) {
        throw new Error("Error al cargar insumos")
      }

      const data = await response.json()
      setInsumos(data)
      setError(null)
    } catch (error) {
      console.error("Error al cargar insumos:", error)
      setError("Error al cargar la lista de insumos")
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar insumos al montar el componente
  useEffect(() => {
    loadInsumos()
  }, [])

  // Función para eliminar un insumo
  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Está seguro que desea eliminar el insumo "${nombre}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/insumos/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al eliminar insumo")
      }

      // Recargar la lista de insumos
      await loadInsumos()
    } catch (error) {
      console.error("Error al eliminar insumo:", error)
      alert(error instanceof Error ? error.message : "Error desconocido al eliminar insumo")
    }
  }

  // Función para ordenar
  const handleSort = (field: keyof Insumo) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Filtrar y ordenar insumos
  const filteredAndSortedInsumos = insumos
    .filter(
      (insumo) =>
        insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insumo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })

  // Función para obtener el color del badge según el stock
  const getStockBadgeVariant = (cantidad: number) => {
    if (cantidad === 0) return "destructive"
    if (cantidad <= 10) return "secondary"
    return "default"
  }

  if (isLoading) {
    return (
      <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Cargando insumos...</span>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Inventario de Insumos</h1>
            <p className="text-gray-600">Gestione su inventario de insumos de talabartería</p>
          </div>
          <Link href="/insumos/nuevo">
            <Button className="mt-4 sm:mt-0">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Insumo
            </Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Insumos Disponibles
            </CardTitle>
            <CardDescription>
              Listado completo de insumos para talabartería ({filteredAndSortedInsumos.length} insumos)
            </CardDescription>

            <div className="relative mt-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar por nombre o descripción..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" className="h-auto p-0 font-semibold" onClick={() => handleSort("nombre")}>
                      <div className="flex items-center">
                        Nombre
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold"
                      onClick={() => handleSort("precio_volumen")}
                    >
                      <div className="flex items-center">
                        Precio Volumen
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold"
                      onClick={() => handleSort("cantidad_volumen")}
                    >
                      <div className="flex items-center">
                        Stock
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold"
                      onClick={() => handleSort("precio_unidad")}
                    >
                      <div className="flex items-center">
                        Precio Unitario
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </Button>
                  </TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedInsumos.length > 0 ? (
                  filteredAndSortedInsumos.map((insumo) => (
                    <TableRow key={insumo.id}>
                      <TableCell className="font-medium">{insumo.nombre}</TableCell>
                      <TableCell>${insumo.precio_volumen.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getStockBadgeVariant(insumo.cantidad_volumen)}>
                          {insumo.cantidad_volumen}
                          {insumo.cantidad_volumen === 0 && " - Sin stock"}
                          {insumo.cantidad_volumen > 0 && insumo.cantidad_volumen <= 10 && " - Stock bajo"}
                        </Badge>
                      </TableCell>
                      <TableCell>${insumo.precio_unidad.toFixed(2)}</TableCell>
                      <TableCell className="max-w-xs truncate" title={insumo.descripcion}>
                        {insumo.descripcion || "Sin descripción"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/insumos/editar/${insumo.id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(insumo.id, insumo.nombre)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      {searchTerm
                        ? "No se encontraron insumos con ese criterio de búsqueda"
                        : "No hay insumos registrados"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{insumos.length}</div>
                <div className="text-sm text-gray-500">Total Insumos</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {insumos.filter((i) => i.cantidad_volumen === 0).length}
                </div>
                <div className="text-sm text-gray-500">Sin Stock</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {insumos.filter((i) => i.cantidad_volumen > 0 && i.cantidad_volumen <= 10).length}
                </div>
                <div className="text-sm text-gray-500">Stock Bajo</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${insumos.reduce((sum, insumo) => sum + insumo.precio_volumen, 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">Valor Total</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

