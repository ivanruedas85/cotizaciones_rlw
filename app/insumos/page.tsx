import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlusCircle, Package, ArrowUpDown } from "lucide-react"
import insumosData from "@/data/insumos.json"

export default function InsumosPage() {
  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Inventario de Insumos</h1>
            <p className="text-gray-600">Gestione su inventario de insumos de talabartería</p>
          </div>
          <Button className="mt-4 sm:mt-0">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Insumo
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Insumos Disponibles
            </CardTitle>
            <CardDescription>Listado completo de insumos para talabartería</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center">
                      Nombre
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Precio Volumen</TableHead>
                  <TableHead>Cantidad Disponible</TableHead>
                  <TableHead>Precio Unitario</TableHead>
                  <TableHead>Descripción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insumosData.map((insumo) => (
                  <TableRow key={insumo.id}>
                    <TableCell className="font-medium">{insumo.nombre}</TableCell>
                    <TableCell>${insumo.precio_volumen.toFixed(2)}</TableCell>
                    <TableCell>{insumo.cantidad_volumen}</TableCell>
                    <TableCell>${insumo.precio_unidad.toFixed(2)}</TableCell>
                    <TableCell className="max-w-xs truncate">{insumo.descripcion}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
