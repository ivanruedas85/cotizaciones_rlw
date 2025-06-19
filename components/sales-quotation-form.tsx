"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Save, FileText, AlertCircle, Loader2 } from "lucide-react"
import { InsumosSelector } from "./insumos-selector"
import { ClientForm, type Cliente } from "./client-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

// Tipo para los insumos seleccionados
type InsumoSeleccionado = {
  id: string
  nombre: string
  cantidad_uso: number
  precio_unidad: number
}

// Estados disponibles
const ESTADOS_COTIZACION = ["Pendiente", "Aprobada", "Rechazada", "En proceso", "Completada", "Cancelada"]

export function SalesQuotationForm() {
  const router = useRouter()

  // Estado para los valores del formulario
  const [precioPiel, setPrecioPiel] = useState<number>(0)
  const [alto, setAlto] = useState<number>(0)
  const [largo, setLargo] = useState<number>(0)
  const [porcentajeSeleccionado, setPorcentajeSeleccionado] = useState<number>(10)
  const [valorInsumos, setValorInsumos] = useState<number>(0)
  const [descripcion, setDescripcion] = useState<string>("")
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>("Pendiente")
  const [insumosSeleccionados, setInsumosSeleccionados] = useState<InsumoSeleccionado[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [showAlert, setShowAlert] = useState<boolean>(false)

  // Estado para los resultados calculados
  const [precioUnitario, setPrecioUnitario] = useState<number>(0)
  const [precioResiduo, setPrecioResiduo] = useState<number>(0)
  const [totalResiduo, setTotalResiduo] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)

  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Realizar cálculos cuando cambien los valores
  useEffect(() => {
    // 1. precio_piel * 1 / 100 = precio_unitario
    const calculoPrecioUnitario = (precioPiel * 1) / 100
    setPrecioUnitario(calculoPrecioUnitario)

    // 2. alto * largo / 100 = precio_residuo
    const calculoPrecioResiduo = (alto * largo) / 100
    setPrecioResiduo(calculoPrecioResiduo)

    // 3. precio_residuo + % seleccionado de un input = total_residuo
    const porcentajeAdicional = calculoPrecioResiduo * (porcentajeSeleccionado / 100)
    const calculoTotalResiduo = calculoPrecioResiduo + porcentajeAdicional
    setTotalResiduo(calculoTotalResiduo)

    // 4. precio_unitario * total_residuo = total
    const calculoTotal = calculoPrecioUnitario * calculoTotalResiduo

    // 5. Sumar el valor de los insumos al total
    const totalConInsumos = calculoTotal + valorInsumos

    setTotal(totalConInsumos)
  }, [precioPiel, alto, largo, porcentajeSeleccionado, valorInsumos])

  // Función para manejar el guardado de la cotización
  const handleSaveQuotation = async () => {
    // Validar que haya un cliente seleccionado
    if (!clienteSeleccionado) {
      setShowAlert(true)
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const nuevaCotizacion = {
        clienteId: clienteSeleccionado.id,
        cliente: {
          nombre: clienteSeleccionado.nombre,
          telefono: clienteSeleccionado.telefono,
        },
        descripcion: descripcion || "Sin descripción",
        estado: estadoSeleccionado,
        detalles: {
          precioPiel,
          alto,
          largo,
          porcentaje: porcentajeSeleccionado,
          precioUnitario,
          precioResiduo,
          totalResiduo,
          valorInsumos,
        },
        insumos: insumosSeleccionados.map((insumo) => ({
          id: insumo.id,
          nombre: insumo.nombre,
          cantidad: insumo.cantidad_uso,
          precioUnitario: insumo.precio_unidad,
        })),
        total,
      }

      const response = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevaCotizacion),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar la cotización")
      }

      setSuccess(`Cotización guardada correctamente con ID: ${data.id}`)

      // Limpiar el formulario después de un breve delay
      setTimeout(() => {
        router.push("/cotizaciones")
      }, 2000)
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para generar un PDF o reporte
  const handleGenerateReport = async () => {
    // Validar que haya un cliente seleccionado
    if (!clienteSeleccionado) {
      setShowAlert(true)
      return
    }

    // Crear objeto de cotización temporal para el reporte
    const cotizacionTemporal = {
      id: "PREVIEW",
      fecha: new Date().toISOString().split("T")[0],
      estado: estadoSeleccionado,
      clienteId: clienteSeleccionado.id,
      cliente: {
        nombre: clienteSeleccionado.nombre,
        telefono: clienteSeleccionado.telefono,
      },
      descripcion: descripcion || "Sin descripción",
      detalles: {
        precioPiel,
        alto,
        largo,
        porcentaje: porcentajeSeleccionado,
        precioUnitario,
        precioResiduo,
        totalResiduo,
        valorInsumos,
      },
      insumos: insumosSeleccionados.map((insumo) => ({
        id: insumo.id,
        nombre: insumo.nombre,
        cantidad: insumo.cantidad_uso,
        precioUnitario: insumo.precio_unidad,
      })),
      total,
    }

    // Generar PDF de vista previa
    const { viewQuotationPDF } = await import("@/utils/pdf-generator")
    viewQuotationPDF(cotizacionTemporal)
  }

  // Función para actualizar el valor total de insumos y la lista de insumos
  const handleInsumosUpdate = (total: number, insumos: InsumoSeleccionado[]) => {
    setValorInsumos(total)
    setInsumosSeleccionados(insumos)
  }

  // Función para manejar la selección de cliente
  const handleClientSelect = (cliente: Cliente) => {
    setClienteSeleccionado(cliente)
    setShowAlert(false)
  }

  return (
    <div className="space-y-6">
      {/* Información del cliente */}
      <ClientForm onClientSelect={handleClientSelect} />

      {/* Alerta si no hay cliente seleccionado */}
      {showAlert && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Debe seleccionar un cliente antes de guardar la cotización o generar un reporte.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertTitle>¡Éxito!</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Descripción y estado de la cotización */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Cotización</CardTitle>
          <CardDescription>Agregue una descripción y seleccione el estado inicial</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              placeholder="Ejemplo: Tapizado de sillones, Cuero para sofás, etc."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado de la Cotización</Label>
            <Select value={estadoSeleccionado} onValueChange={setEstadoSeleccionado}>
              <SelectTrigger id="estado">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_COTIZACION.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pestañas para cálculo e insumos */}
      <Tabs defaultValue="calculo">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="calculo">Cálculo de Precio</TabsTrigger>
          <TabsTrigger value="insumos">Insumos</TabsTrigger>
        </TabsList>

        <TabsContent value="calculo">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Cálculo de Precio</CardTitle>
              <CardDescription>Ingrese los datos para calcular el precio total</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="precioPiel">Precio de la Piel</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="precioPiel"
                      type="number"
                      placeholder="0.00"
                      className="pl-8"
                      value={precioPiel || ""}
                      onChange={(e) => setPrecioPiel(Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="porcentaje">Porcentaje Adicional</Label>
                  <Select
                    value={porcentajeSeleccionado.toString()}
                    onValueChange={(value) => setPorcentajeSeleccionado(Number.parseInt(value))}
                  >
                    <SelectTrigger id="porcentaje">
                      <SelectValue placeholder="Seleccionar porcentaje" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25%</SelectItem>
                      <SelectItem value="50">50%</SelectItem>
                      <SelectItem value="75">75%</SelectItem>
                      <SelectItem value="100">100%</SelectItem>
                      <SelectItem value="125">125%</SelectItem>
                      <SelectItem value="150">150%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alto">Alto (cm)</Label>
                  <Input
                    id="alto"
                    type="number"
                    placeholder="0"
                    value={alto || ""}
                    onChange={(e) => setAlto(Number.parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="largo">Largo (cm)</Label>
                  <Input
                    id="largo"
                    type="number"
                    placeholder="0"
                    value={largo || ""}
                    onChange={(e) => setLargo(Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium text-lg mb-4 flex items-center">
                  <Calculator className="mr-2 h-5 w-5" />
                  Resultados del Cálculo
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="precioUnitario">Precio Unitario</Label>
                    <Input
                      id="precioUnitario"
                      type="text"
                      value={`$${precioUnitario.toFixed(2)}`}
                      readOnly
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">precio_piel * 1 / 100</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precioResiduo">Precio Residuo</Label>
                    <Input
                      id="precioResiduo"
                      type="text"
                      value={`${precioResiduo.toFixed(2)}`}
                      readOnly
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">alto * largo / 100</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalResiduo">Total Residuo</Label>
                    <Input
                      id="totalResiduo"
                      type="text"
                      value={`${totalResiduo.toFixed(2)}`}
                      readOnly
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">precio_residuo + {porcentajeSeleccionado}%</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valorInsumos">Valor Insumos</Label>
                    <Input
                      id="valorInsumos"
                      type="text"
                      value={`$${valorInsumos.toFixed(2)}`}
                      readOnly
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">Total de insumos seleccionados</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="total" className="font-semibold text-lg">
                      TOTAL FINAL
                    </Label>
                    <div className="text-2xl font-bold text-right">${total.toFixed(2)}</div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">(precio_unitario * total_residuo) + valor_insumos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insumos">
          <InsumosSelector onTotalChange={(total, insumos) => handleInsumosUpdate(total, insumos)} />
        </TabsContent>
      </Tabs>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="w-full sm:w-auto" onClick={handleSaveQuotation} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cotización
            </>
          )}
        </Button>
        <Button variant="outline" className="w-full sm:w-auto" onClick={handleGenerateReport} disabled={isLoading}>
          <FileText className="mr-2 h-4 w-4" />
          Vista Previa PDF
        </Button>
      </div>
    </div>
  )
}

