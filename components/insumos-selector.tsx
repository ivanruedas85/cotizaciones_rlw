"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Minus, Package } from "lucide-react"
import insumosData from "@/data/insumos.json"

export type Insumo = {
  id: string
  nombre: string
  precio_volumen: number
  cantidad_volumen: number
  precio_unidad: number
  cantidad_uso?: number
  descripcion: string
}

interface InsumosProps {
  onTotalChange: (total: number, insumos: Insumo[]) => void
}

export function InsumosSelector({ onTotalChange }: InsumosProps) {
  const [insumos, setInsumos] = useState<Insumo[]>(insumosData)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInsumos, setSelectedInsumos] = useState<Insumo[]>([])
  const [valorTotal, setValorTotal] = useState(0)

  // Filtrar insumos según el término de búsqueda
  const filteredInsumos = insumos.filter((insumo) => insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase()))

  // Calcular el valor total cuando cambian los insumos seleccionados
  useEffect(() => {
    const total = selectedInsumos.reduce((sum, insumo) => {
      return sum + insumo.precio_unidad * (insumo.cantidad_uso || 0)
    }, 0)

    setValorTotal(total)
    onTotalChange(total, selectedInsumos)
  }, [selectedInsumos, onTotalChange])

  // Agregar insumo a la selección
  const handleAddInsumo = (insumo: Insumo) => {
    // Verificar si ya está en la lista
    const existingIndex = selectedInsumos.findIndex((item) => item.id === insumo.id)

    if (existingIndex >= 0) {
      // Si ya existe, incrementar la cantidad_uso
      const updatedInsumos = [...selectedInsumos]
      const currentUso = updatedInsumos[existingIndex].cantidad_uso || 0

      if (currentUso < insumo.cantidad_volumen) {
        updatedInsumos[existingIndex] = {
          ...updatedInsumos[existingIndex],
          cantidad_uso: currentUso + 1,
        }
        setSelectedInsumos(updatedInsumos)

        // Actualizar el stock disponible
        updateInsumoStock(insumo.id, 1)
      }
    } else {
      // Si no existe y hay stock, agregarlo con cantidad_uso = 1
      if (insumo.cantidad_volumen > 0) {
        setSelectedInsumos([...selectedInsumos, { ...insumo, cantidad_uso: 1 }])

        // Actualizar el stock disponible
        updateInsumoStock(insumo.id, 1)
      }
    }
  }

  // Reducir la cantidad de un insumo seleccionado
  const handleReduceInsumo = (insumoId: string) => {
    const existingIndex = selectedInsumos.findIndex((item) => item.id === insumoId)

    if (existingIndex >= 0) {
      const updatedInsumos = [...selectedInsumos]
      const currentUso = updatedInsumos[existingIndex].cantidad_uso || 0

      if (currentUso > 1) {
        // Reducir la cantidad
        updatedInsumos[existingIndex] = {
          ...updatedInsumos[existingIndex],
          cantidad_uso: currentUso - 1,
        }
        setSelectedInsumos(updatedInsumos)
      } else {
        // Eliminar el insumo de la selección
        updatedInsumos.splice(existingIndex, 1)
        setSelectedInsumos(updatedInsumos)
      }

      // Devolver al stock
      updateInsumoStock(insumoId, -1)
    }
  }

  // Actualizar el stock de un insumo
  const updateInsumoStock = (insumoId: string, cantidad: number) => {
    setInsumos((prevInsumos) =>
      prevInsumos.map((insumo) =>
        insumo.id === insumoId ? { ...insumo, cantidad_volumen: insumo.cantidad_volumen - cantidad } : insumo,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Insumos de Talabartería
          </CardTitle>
          <CardDescription>Seleccione los insumos para su proyecto</CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar insumos..."
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
                <TableHead>Nombre</TableHead>
                <TableHead>Precio Unitario</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInsumos.length > 0 ? (
                filteredInsumos.map((insumo) => (
                  <TableRow key={insumo.id}>
                    <TableCell className="font-medium">{insumo.nombre}</TableCell>
                    <TableCell>${insumo.precio_unidad.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={insumo.cantidad_volumen > 10 ? "default" : "destructive"}>
                        {insumo.cantidad_volumen}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddInsumo(insumo)}
                        disabled={insumo.cantidad_volumen <= 0}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Agregar</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                    No se encontraron insumos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedInsumos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Insumos Seleccionados</CardTitle>
            <CardDescription>Insumos que se utilizarán en el proyecto</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Precio Unitario</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedInsumos.map((insumo) => (
                  <TableRow key={insumo.id}>
                    <TableCell className="font-medium">{insumo.nombre}</TableCell>
                    <TableCell>${insumo.precio_unidad.toFixed(2)}</TableCell>
                    <TableCell>{insumo.cantidad_uso}</TableCell>
                    <TableCell>${(insumo.precio_unidad * (insumo.cantidad_uso || 0)).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleReduceInsumo(insumo.id)}>
                        <Minus className="h-4 w-4" />
                        <span className="sr-only">Reducir</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold">
                    Total Insumos:
                  </TableCell>
                  <TableCell colSpan={2} className="font-bold">
                    ${valorTotal.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
