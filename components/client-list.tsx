"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileText, Edit, Trash2, User, Phone, Mail, Calendar, Loader2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Tipo para los clientes
export type Cliente = {
  id: string
  nombre: string
  telefono: string
  email?: string
  direccion?: string
  fechaRegistro?: string
  categoria?: string
}

export function ClientList() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Cargar clientes desde la API
  const loadClientes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/clientes")

      if (!response.ok) {
        throw new Error("Error al cargar clientes")
      }

      const data = await response.json()
      setClientes(data)
      setError(null)
    } catch (error) {
      console.error("Error al cargar clientes:", error)
      setError("Error al cargar la lista de clientes")
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClientes()
  }, [])

  // Filtrar clientes según el término de búsqueda
  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefono.includes(searchTerm) ||
      (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cliente.categoria && cliente.categoria.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Función para eliminar un cliente
  const handleDelete = async (id: string, nombre: string) => {
    try {
      setDeletingId(id)

      const response = await fetch(`/api/clientes/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al eliminar cliente")
      }

      // Recargar la lista de clientes
      await loadClientes()
    } catch (error) {
      console.error("Error al eliminar cliente:", error)
      alert(error instanceof Error ? error.message : "Error desconocido al eliminar cliente")
    } finally {
      setDeletingId(null)
    }
  }

  const getCategoriaColor = (categoria?: string) => {
    switch (categoria) {
      case "premium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "mayorista":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "corporativo":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando clientes...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2 h-5 w-5" />
          Listado de Clientes
        </CardTitle>
        <CardDescription>Gestione su cartera de clientes</CardDescription>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar por nombre, teléfono, email o categoría..."
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
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Fecha Registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClientes.length > 0 ? (
              filteredClientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      {cliente.nombre}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      {cliente.telefono}
                    </div>
                  </TableCell>
                  <TableCell>
                    {cliente.email ? (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="truncate max-w-[200px]">{cliente.email}</span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        No disponible
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {cliente.categoria ? (
                      <Badge className={getCategoriaColor(cliente.categoria)}>
                        {cliente.categoria.charAt(0).toUpperCase() + cliente.categoria.slice(1)}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        Sin categoría
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {cliente.fechaRegistro ? (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        {new Date(cliente.fechaRegistro).toLocaleDateString()}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        No disponible
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/clientes/${cliente.id}`}>
                        <Button variant="ghost" size="icon" title="Ver detalles">
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Button>
                      </Link>
                      <Link href={`/clientes/editar/${cliente.id}`}>
                        <Button variant="ghost" size="icon" title="Editar cliente">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Eliminar cliente"
                            disabled={deletingId === cliente.id}
                          >
                            {deletingId === cliente.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Está seguro que desea eliminar al cliente "{cliente.nombre}"? Esta acción no se puede
                              deshacer y se perderán todas las cotizaciones asociadas.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(cliente.id, cliente.nombre)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                  {searchTerm
                    ? "No se encontraron clientes con ese criterio de búsqueda"
                    : "No hay clientes registrados"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

