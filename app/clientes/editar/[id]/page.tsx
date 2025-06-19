"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, User, Phone, Mail, MapPin, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import type { Cliente } from "@/utils/db-services"

export default function EditarClientePage() {
    const params = useParams()
    const router = useRouter()
    const clienteId = params.id as string

    const [cliente, setCliente] = useState<Cliente | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        nombre: "",
        telefono: "",
        email: "",
        direccion: "",
        categoria: "",
        notas: "",
    })

    // Cargar datos del cliente
    const loadCliente = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await fetch(`/api/clientes/${clienteId}`)

            if (!response.ok) {
                if (response.status === 404) {
                    setError("Cliente no encontrado")
                    return
                }
                throw new Error("Error al cargar cliente")
            }

            const clienteData = await response.json()
            setCliente(clienteData)

            // Llenar el formulario con los datos existentes
            setFormData({
                nombre: clienteData.nombre || "",
                telefono: clienteData.telefono || "",
                email: clienteData.email || "",
                direccion: clienteData.direccion || "",
                categoria: clienteData.categoria || "",
                notas: clienteData.notas || "",
            })
        } catch (error) {
            console.error("Error:", error)
            setError("Error al cargar los datos del cliente")
        } finally {
            setIsLoading(false)
        }
    }

    // Guardar cambios
    const handleSave = async () => {
        // Validación básica
        if (formData.nombre.trim() === "" || formData.telefono.trim() === "") {
            setError("El nombre y teléfono son obligatorios")
            return
        }

        // Validar email si se proporciona
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError("El formato del email no es válido")
            return
        }

        try {
            setIsSaving(true)
            setError(null)
            setSuccess(null)

            const response = await fetch(`/api/clientes/${clienteId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nombre: formData.nombre.trim(),
                    telefono: formData.telefono.trim(),
                    email: formData.email.trim() || undefined,
                    direccion: formData.direccion.trim() || undefined,
                    categoria: formData.categoria || undefined,
                    notas: formData.notas.trim() || undefined,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Error al actualizar el cliente")
            }

            setSuccess("Cliente actualizado correctamente")
            setCliente(data)

            // Redirigir después de un breve delay
            setTimeout(() => {
                router.push(`/clientes/${clienteId}`)
            }, 1500)
        } catch (error) {
            console.error("Error:", error)
            setError(error instanceof Error ? error.message : "Error desconocido")
        } finally {
            setIsSaving(false)
        }
    }

    // Manejar cambios en el formulario
    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
        // Limpiar errores cuando el usuario empiece a escribir
        if (error) setError(null)
    }

    // Cargar datos al montar el componente
    useEffect(() => {
        loadCliente()
    }, [clienteId])

    if (isLoading) {
        return (
            <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-background">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">Cargando información del cliente...</span>
                    </div>
                </div>
            </main>
        )
    }

    if (error && !cliente) {
        return (
            <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-background">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                        <Link href="/clientes">
                            <Button variant="outline" className="flex items-center">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver a Clientes
                            </Button>
                        </Link>
                    </div>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-background">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <Link href={`/clientes/${clienteId}`}>
                        <Button variant="outline" className="flex items-center">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al Cliente
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <User className="mr-2 h-5 w-5" />
                            Editar Cliente
                        </CardTitle>
                        <CardDescription>Modifique la información del cliente {cliente?.nombre}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="border-green-200 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">
                                    Nombre del Cliente <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        id="nombre"
                                        placeholder="Nombre completo"
                                        className="pl-8"
                                        value={formData.nombre}
                                        onChange={(e) => handleInputChange("nombre", e.target.value)}
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telefono">
                                    Teléfono <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        id="telefono"
                                        placeholder="Número de teléfono"
                                        className="pl-8"
                                        value={formData.telefono}
                                        onChange={(e) => handleInputChange("telefono", e.target.value)}
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Correo electrónico"
                                        className="pl-8"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="categoria">Categoría</Label>
                                <Select
                                    value={formData.categoria}
                                    onValueChange={(value) => handleInputChange("categoria", value)}
                                    disabled={isSaving}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sin_categoria">Sin categoría</SelectItem>
                                        <SelectItem value="premium">Premium</SelectItem>
                                        <SelectItem value="regular">Regular</SelectItem>
                                        <SelectItem value="mayorista">Mayorista</SelectItem>
                                        <SelectItem value="minorista">Minorista</SelectItem>
                                        <SelectItem value="corporativo">Corporativo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="direccion">Dirección</Label>
                            <div className="relative">
                                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="direccion"
                                    placeholder="Dirección completa"
                                    className="pl-8"
                                    value={formData.direccion}
                                    onChange={(e) => handleInputChange("direccion", e.target.value)}
                                    disabled={isSaving}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notas">Notas</Label>
                            <Textarea
                                id="notas"
                                placeholder="Notas adicionales sobre el cliente..."
                                value={formData.notas}
                                onChange={(e) => handleInputChange("notas", e.target.value)}
                                disabled={isSaving}
                                rows={3}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row gap-2">
                        <Button className="w-full sm:w-auto" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar Cambios
                                </>
                            )}
                        </Button>
                        <Link href={`/clientes/${clienteId}`} className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full" disabled={isSaving}>
                                Cancelar
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </main>
    )
}
