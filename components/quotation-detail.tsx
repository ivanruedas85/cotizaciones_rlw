"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileText, Printer, ArrowLeft, User, Phone, Calendar, Download } from "lucide-react"
import Link from "next/link"
import { viewQuotationPDF, downloadQuotationPDF } from "@/utils/pdf-generator"

// Tipo para la cotización detallada
type QuotationDetail = {
  id: string
  fecha: string
  clienteId: string
  cliente: {
    nombre: string
    telefono: string
    email?: string
    direccion?: string
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

interface QuotationDetailProps {
  quotation: QuotationDetail
}

export function QuotationDetail({ quotation }: QuotationDetailProps) {
  // Función para imprimir la cotización
  const handlePrint = () => {
    window.print()
  }

  // Función para ver el PDF
  const handleViewPDF = () => {
    viewQuotationPDF(quotation)
  }

  // Función para descargar el PDF
  const handleDownloadPDF = () => {
    downloadQuotationPDF(quotation)
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex justify-between items-center print:hidden">
        <Link href="/cotizaciones">
          <Button variant="outline" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Cotizaciones
          </Button>
        </Link>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" onClick={handleViewPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Ver PDF
          </Button>
          <Button onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Descargar PDF
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardHeader className="print:pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Cotización {quotation.id}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Calendar className="mr-1 h-4 w-4" />
                Fecha: {new Date(quotation.fecha).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="text-right print:text-left">
              <div className="text-xl font-bold">Rueda Leather Wallet´s</div>
              <div className="text-sm text-gray-500">Sistema de Gestión de Ventas y Cotizaciones de RLW</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 print:space-y-4">
          {/* Información del cliente */}
          <div className="bg-gray-50 p-4 rounded-lg print:bg-white print:border print:border-gray-200">
            <h3 className="font-medium text-lg mb-2 flex items-center">
              <User className="mr-2 h-5 w-5" />
              Información del Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Nombre:</div>
                <div className="font-medium">{quotation.cliente.nombre}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Teléfono:</div>
                <div className="font-medium flex items-center">
                  <Phone className="mr-1 h-3 w-3" />
                  {quotation.cliente.telefono}
                </div>
              </div>
              {quotation.cliente.email && (
                <div>
                  <div className="text-sm text-gray-500">Email:</div>
                  <div className="font-medium">{quotation.cliente.email}</div>
                </div>
              )}
              {quotation.cliente.direccion && (
                <div>
                  <div className="text-sm text-gray-500">Dirección:</div>
                  <div className="font-medium">{quotation.cliente.direccion}</div>
                </div>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <h3 className="font-medium text-lg mb-2">Descripción</h3>
            <p>{quotation.descripcion}</p>
          </div>

          <Separator />

          {/* Detalles del cálculo */}
          <div>
            <h3 className="font-medium text-lg mb-4">Detalles del Cálculo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Precio de la Piel:</span>
                  <span>${quotation.detalles.precioPiel.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Alto:</span>
                  <span>{quotation.detalles.alto} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Largo:</span>
                  <span>{quotation.detalles.largo} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Porcentaje Adicional:</span>
                  <span>{quotation.detalles.porcentaje}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Precio Unitario:</span>
                  <span>${quotation.detalles.precioUnitario.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Precio Residuo:</span>
                  <span>{quotation.detalles.precioResiduo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Residuo:</span>
                  <span>{quotation.detalles.totalResiduo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Valor Insumos:</span>
                  <span>${quotation.detalles.valorInsumos.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Insumos utilizados */}
          {quotation.insumos.length > 0 && (
            <div>
              <h3 className="font-medium text-lg mb-4">Insumos Utilizados</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Precio Unitario</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotation.insumos.map((insumo) => (
                    <TableRow key={insumo.id}>
                      <TableCell className="font-medium">{insumo.nombre}</TableCell>
                      <TableCell>{insumo.cantidad}</TableCell>
                      <TableCell>${insumo.precioUnitario.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        ${(insumo.cantidad * insumo.precioUnitario).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-bold">
                      Total Insumos:
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ${quotation.detalles.valorInsumos.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          {/* Total final */}
          <div className="bg-gray-100 p-4 rounded-lg print:bg-white print:border-2 print:border-gray-300">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">TOTAL FINAL:</span>
              <span className="text-2xl font-bold">${quotation.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Notas y condiciones */}
          <div className="text-sm text-gray-500 print:mt-8">
            <p>
              <strong>Notas:</strong> Esta cotización es válida por 15 días a partir de la fecha de emisión.
            </p>
            <p className="mt-1">
              <strong>Condiciones de pago:</strong> 50% de anticipo y 50% contra entrega.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-gray-500 print:mt-8 print:border-t print:pt-4">
          <div>GestorVentas © {new Date().getFullYear()}</div>
          <div>Cotización generada el {new Date().toLocaleString()}</div>
        </CardFooter>
      </Card>
    </div>
  )
}

