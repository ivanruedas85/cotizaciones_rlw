import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { Quotation } from "@/components/quotation-list"
import { SITE_LARGE_TITLE } from "./const"

// Datos de la empresa (en un entorno real, esto podría venir de una configuración)
const companyInfo = {
  name: "Rueda Leather Wallets S.A.",
  address: "Infonavit Deportiva s/n",
  phone: "9371176509",
  email: "ruedaleatherwallets@gmail.com",
  website: "https://catalogorlw.netlify.app/",
  taxId: "RFC: RLWS-040520-UK1",
}

// Función para ver el PDF en el navegador
export const viewQuotationPDF = (quotation: Quotation) => {
  const doc = createQuotationPDF(quotation)

  // Crear blob URL y abrir en nueva pestaña
  const pdfBlob = doc.output("blob")
  const blobUrl = URL.createObjectURL(pdfBlob)

  // Abrir en nueva pestaña
  const newWindow = window.open(blobUrl, "_blank")

  // Limpiar el blob URL después de un tiempo para liberar memoria
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl)
  }, 10000)

  // Si no se pudo abrir la ventana, descargar el archivo
  if (!newWindow) {
    downloadQuotationPDF(quotation)
  }
}

// Función para descargar el PDF
export const downloadQuotationPDF = (quotation: Quotation) => {
  const doc = createQuotationPDF(quotation)
  doc.save(`Cotizacion-${quotation.id}.pdf`)
}

// Función auxiliar que crea el PDF (código común)
const createQuotationPDF = (quotation: Quotation) => {
  // Crear un nuevo documento PDF
  const doc = new jsPDF()

  // Configurar fuentes
  doc.setFont("helvetica")

  // Añadir información de la empresa
  doc.setFontSize(18)
  doc.setTextColor(40, 40, 40)
  doc.text(companyInfo.name, 105, 20, { align: "center" })

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(companyInfo.address, 105, 27, { align: "center" })
  doc.text(`Tel: ${companyInfo.phone} | Email: ${companyInfo.email}`, 105, 32, { align: "center" })
  doc.text(companyInfo.website, 105, 37, { align: "center" })
  doc.text(companyInfo.taxId, 105, 42, { align: "center" })

  // Línea divisoria
  doc.setDrawColor(220, 220, 220)
  doc.line(20, 45, 190, 45)

  // Título del documento
  doc.setFontSize(16)
  doc.setTextColor(40, 40, 40)
  doc.text(`COTIZACIÓN #${quotation.id}`, 20, 55)

  // Fecha
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Fecha: ${new Date(quotation.fecha).toLocaleDateString()}`, 20, 62)

  // Estado de la cotización
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Estado: ${quotation.estado}`, 20, 68)

  // Información del cliente
  doc.setFontSize(12)
  doc.setTextColor(40, 40, 40)
  doc.text("CLIENTE", 20, 72)

  doc.setFontSize(10)
  doc.text(`Nombre: ${quotation.cliente.nombre}`, 20, 80)
  doc.text(`Teléfono: ${quotation.cliente.telefono}`, 20, 86)

  // Descripción de la cotización
  doc.setFontSize(12)
  doc.setTextColor(40, 40, 40)
  doc.text("DESCRIPCIÓN", 20, 100)

  doc.setFontSize(10)
  // Manejar texto largo para descripción
  const splitDescription = doc.splitTextToSize(quotation.descripcion, 170)
  doc.text(splitDescription, 20, 108)

  // Calcular la posición Y después de la descripción
  const descriptionHeight = Array.isArray(splitDescription) ? splitDescription.length * 5 : 5
  const currentY = 108 + descriptionHeight + 10

  // Detalles del cálculo
  doc.setFontSize(12)
  doc.setTextColor(40, 40, 40)
  doc.text("DETALLES DEL CÁLCULO", 20, currentY)

  const detallesData = [
    //["Precio de la Piel", `$${quotation.detalles.precioPiel.toFixed(2)}`],
    ["Alto", `${quotation.detalles.alto} cm`],
    ["Largo", `${quotation.detalles.largo} cm`],
    //["Porcentaje Adicional", `${quotation.detalles.porcentaje}%`],
    ["Precio Unitario", `$${quotation.detalles.precioUnitario.toFixed(2)}`],
    //["Precio Residuo", `${quotation.detalles.precioResiduo.toFixed(2)}`],
    //["Total Residuo", `${quotation.detalles.totalResiduo.toFixed(2)}`],
    ["Valor Insumos", `$${quotation.detalles.valorInsumos.toFixed(2)}`],
  ]

  // Usar autoTable correctamente
  autoTable(doc, {
    startY: currentY + 5,
    head: [["Concepto", "Valor"]],
    body: detallesData,
    theme: "grid",
    headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 50, halign: "right" },
    },
  })

  // Obtener la posición Y final de la tabla anterior
  const finalY = (doc as any).lastAutoTable.finalY || currentY + 80

  // Insumos utilizados
  if (quotation.insumos && quotation.insumos.length > 0) {
    const insumosY = finalY + 10

    doc.setFontSize(12)
    doc.setTextColor(40, 40, 40)
    doc.text("INSUMOS UTILIZADOS", 20, insumosY)

    const insumosData = quotation.insumos.map((insumo) => [
      insumo.nombre,
      insumo.cantidad.toString(),
      `$${insumo.precioUnitario.toFixed(2)}`,
      `$${(insumo.cantidad * insumo.precioUnitario).toFixed(2)}`,
    ])

    autoTable(doc, {
      startY: insumosY + 5,
      head: [["Nombre", "Cantidad", "Precio Unitario", "Subtotal"]],
      body: insumosData,
      theme: "grid",
      headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
      columnStyles: {
        3: { halign: "right" },
      },
    })

    // Añadir total de insumos
    const insumosFinalY = (doc as any).lastAutoTable.finalY + 2
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("Total Insumos:", 130, insumosFinalY)
    doc.text(`$${quotation.detalles.valorInsumos.toFixed(2)}`, 190, insumosFinalY, { align: "right" })
  }

  // Total final
  const totalFinalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 15 : finalY + 15

  doc.setFillColor(240, 240, 240)
  doc.rect(20, totalFinalY - 5, 170, 12, "F")

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(40, 40, 40)
  doc.text("TOTAL FINAL:", 25, totalFinalY + 2)
  doc.setFontSize(14)
  doc.text(`$${quotation.total.toFixed(2)}`, 185, totalFinalY + 2, { align: "right" })

  // Notas y condiciones
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 100, 100)
  doc.text("Notas: Esta cotización es válida por 7 días a partir de la fecha de emisión.", 20, totalFinalY + 15)
  doc.text("Condiciones de pago: 50% de anticipo y 50% contra entrega.", 20, totalFinalY + 20)
  doc.text("Notas: En caso de no liquidar el monto a deber en el plazo declarado por el vendedor,", 20, totalFinalY + 25)
  doc.text("            este pierde anticipo y el producto.", 20, totalFinalY + 30)

  // Pie de página
  doc.setFontSize(8)
  doc.text(
    `${SITE_LARGE_TITLE} © ${new Date().getFullYear()} | Cotización generada el ${new Date().toLocaleString()}`,
    105,
    285,
    { align: "center" },
  )

  return doc
}

// Mantener la función original para compatibilidad (ahora usa viewQuotationPDF)
export const generateQuotationPDF = (quotation: Quotation) => {
  viewQuotationPDF(quotation)
}
