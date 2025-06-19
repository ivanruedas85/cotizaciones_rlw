"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { User, Search, Plus, Phone, Users, Loader2 } from "lucide-react"
import Link from "next/link"

export type Cliente = {
  id: string
  nombre: string
  telefono: string
  email?: string
  direccion?: string
  fechaRegistro?: string
}

interface ClientFormProps {
  onClientSelect: (cliente: Cliente) => void
}

export function ClientForm({ onClientSelect }: ClientFormProps) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Cargar clientes desde la API
  const loadClientes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/clientes")

      if (response.ok) {
        const data = await response.json()
        setClientes(data)
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error)
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
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || cliente.telefono.includes(searchTerm),
  )

  // Cuando se selecciona un cliente
  useEffect(() => {
    if (selectedClientId) {
      const cliente = clientes.find((c) => c.id === selectedClientId)
      if (cliente) {
        onClientSelect(cliente)
      }
    }
  }, [selectedClientId, clientes, onClientSelect])

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Seleccionar Cliente
          </CardTitle>
          <Link href="/clientes">
            <Button variant="outline" size="sm" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Ver todos los clientes
            </Button>
          </Link>
        </div>
        <CardDescription>Seleccione un cliente existente o agregue uno nuevo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="clienteExistente">Cliente Existente</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre o teléfono..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Link href="/clientes/nuevo">
                <Button variant="outline" className="whitespace-nowrap">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Cliente
                </Button>
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Cargando clientes...</span>
            </div>
          ) : (
            <>
              {filteredClientes.length > 0 && (
                <div className="grid gap-2 max-h-60 overflow-y-auto p-1">
                  {filteredClientes.map((cliente) => (
                    <div
                      key={cliente.id}
                      className={`p-3 rounded-md cursor-pointer border ${selectedClientId === cliente.id
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-gray-100 border-transparent"
                        }`}
                      onClick={() => setSelectedClientId(cliente.id)}
                    >
                      <div className="font-medium">{cliente.nombre}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {cliente.telefono}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredClientes.length === 0 && searchTerm && !isLoading && (
                <div className="text-center py-4 text-gray-500">
                  No se encontraron clientes. ¿Desea{" "}
                  <Link href="/clientes/nuevo" className="text-primary underline">
                    agregar un nuevo cliente
                  </Link>
                  ?
                </div>
              )}
            </>
          )}

          {selectedClientId && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium mb-2">Cliente Seleccionado</h4>
              {clientes
                .filter((c) => c.id === selectedClientId)
                .map((cliente) => (
                  <div key={cliente.id} className="space-y-1">
                    <div className="font-medium text-lg">{cliente.nombre}</div>
                    <div className="text-sm text-gray-500">
                      <span className="inline-flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {cliente.telefono}
                      </span>
                    </div>
                    {cliente.email && <div className="text-sm text-gray-500">Email: {cliente.email}</div>}
                    {cliente.direccion && <div className="text-sm text-gray-500">Dirección: {cliente.direccion}</div>}
                  </div>
                ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

