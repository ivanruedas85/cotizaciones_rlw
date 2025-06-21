"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Package, DollarSign, Hash, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Insumo = {
  id: string
  nombre: string
  precio_volumen: number
  cantidad_volumen: number
  precio_unidad: number
  descripcion: string
}

export default function EditarInsumoPage() {
  const router = useRouter()
  const params = useParams()
  const insumoId = params.id as string

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [insumo, setInsumo] = useState({
    nombre: "",
    precio_volumen: "",
    cantidad_volumen: "",
    precio_unidad: "",
    descripcion: "",
  })

  // Cargar datos del insumo
  useEffect(() => {
    const loadInsumo = async () => {
      try {
        setIsLoadingData(true)
        const response = await fetch(`/api/insumos/${insumoId}`)

        if (!response.ok) {
          throw new Error("Insumo no encontrado")
        }

        const data: Insumo = await response.json()
        setInsumo({
          nombre: data.nombre,
          precio_volumen: data.precio_volumen.toString(),
          cantidad_volumen: data.cantidad_volumen.toString(),
          precio_unidad: data.precio_unidad.toString(),
          descripcion: data.descripcion,
        })
      } catch (error) {
        console.error("Error al cargar insumo:", error)
        setError("Error al cargar el insumo")
      } finally {
        setIsLoadingData(false)
      }
    }

    if (insumoId) {
      loadInsumo()
    }
  }, [insumoId])

  const handleSaveInsumo = async () => {
    // Validación básica
    if (
      insumo.nombre.trim() === "" ||
      insumo.precio_volumen === "" ||
      insumo.cantidad_volumen === "" ||
      insumo.precio_unidad === ""
    ) {
      setError("Todos los campos son obligatorios excepto la descripción")
      return
    }

    // Validar que los números sean válidos
    const precioVolumen = Number(insumo.precio_volumen)
    const cantidadVolumen = Number(insumo.cantidad_volumen)
    const precioUnidad = Number(insumo.precio_unidad)

    if (isNaN(precioVolumen) || isNaN(cantidadVolumen) || isNaN(precioUnidad)) {
      setError("Los valores numéricos deben ser números válidos")
      return
    }

    if (precioVolumen < 0 || cantidadVolumen < 0 || precioUnidad < 0) {
      setError("Los valores numéricos deben ser positivos")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/insumos/${insumoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: insumo.nombre,
          precio_volumen: precioVolumen,
          cantidad_volumen: cantidadVolumen,
          precio_unidad: precioUnidad,
          descripcion: insumo.descripcion,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar el insumo")
      }

      setSuccess("Insumo actualizado correctamente")

      // Redirigir después de un breve delay
      setTimeout(() => {
        router.push("/insumos")
      }, 1500)
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-background">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Cargando insumo...</span>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-background">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/insumos">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Insumos
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Editar Insumo
            </CardTitle>
            <CardDescription>Modifique la información del insumo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre del Insumo <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Package className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="nombre"
                  placeholder="Ej: Cuero vacuno, Hilo encerado, etc."
                  className="pl-8"
                  value={insumo.nombre}
                  onChange={(e) => setInsumo({ ...insumo, nombre: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precio_volumen">
                  Precio por Volumen <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="precio_volumen"
                    type="number"
                    placeholder="0.00"
                    className="pl-8"
                    value={insumo.precio_volumen}
                    onChange={(e) => setInsumo({ ...insumo, precio_volumen: e.target.value })}
                    disabled={isLoading}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cantidad_volumen">
                  Cantidad Disponible <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Hash className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="cantidad_volumen"
                    type="number"
                    placeholder="0"
                    className="pl-8"
                    value={insumo.cantidad_volumen}
                    onChange={(e) => setInsumo({ ...insumo, cantidad_volumen: e.target.value })}
                    disabled={isLoading}
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio_unidad">
                Precio Unitario <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="precio_unidad"
                  type="number"
                  placeholder="0.00"
                  className="pl-8"
                  value={insumo.precio_unidad}
                  onChange={(e) => setInsumo({ ...insumo, precio_unidad: e.target.value })}
                  disabled={isLoading}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <div className="relative">
                <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Textarea
                  id="descripcion"
                  placeholder="Descripción detallada del insumo (opcional)"
                  className="pl-8 resize-none"
                  value={insumo.descripcion}
                  onChange={(e) => setInsumo({ ...insumo, descripcion: e.target.value })}
                  disabled={isLoading}
                  rows={3}
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Vista Previa del Cálculo</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  Precio por Volumen: ${insumo.precio_volumen || "0.00"} por {insumo.cantidad_volumen || "0"} unidades
                </div>
                <div>Precio Unitario: ${insumo.precio_unidad || "0.00"} por unidad</div>
                {insumo.precio_volumen && insumo.cantidad_volumen && insumo.precio_unidad && (
                  <div className="font-medium text-gray-800">
                    Ahorro por volumen:{" "}
                    {(
                      ((Number(insumo.precio_unidad) * Number(insumo.cantidad_volumen) -
                        Number(insumo.precio_volumen)) /
                        (Number(insumo.precio_unidad) * Number(insumo.cantidad_volumen))) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSaveInsumo} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Actualizar Insumo
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
