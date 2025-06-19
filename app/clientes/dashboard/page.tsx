"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Download, Upload, BarChart3, Users, UserPlus } from "lucide-react"
import Link from "next/link"

type ClientStats = {
    total: number
    nuevosUltimoMes: number
    porCategoria: Record<string, number>
}

export default function ClientDashboardPage() {
    const [stats, setStats] = useState<ClientStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [importFile, setImportFile] = useState<File | null>(null)
    const [importResult, setImportResult] = useState<{ success: boolean; imported: number; errors: number } | null>(null)
    const [isImporting, setIsImporting] = useState(false)

    // Cargar estadísticas
    const loadStats = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await fetch("/api/clientes/stats")

            if (!response.ok) {
                throw new Error("Error al cargar estadísticas")
            }

            const data = await response.json()
            setStats(data)
        } catch (error) {
            console.error("Error:", error)
            setError("No se pudieron cargar las estadísticas")
        } finally {
            setIsLoading(false)
        }
    }

    // Cargar estadísticas al montar el componente
    useEffect(() => {
        loadStats()
    }, [])

    // Manejar la exportación de clientes
    const handleExport = () => {
        window.open("/api/clientes/export", "_blank")
    }

    // Manejar la selección de archivo para importar
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImportFile(e.target.files[0])
            setImportResult(null)
        }
    }

    // Manejar la importación de clientes
    const handleImport = async () => {
        if (!importFile) return

        try {
            setIsImporting(true)
            setImportResult(null)

            // Leer el archivo
            const fileContent = await importFile.text()

            // Enviar los datos al servidor
            const response = await fetch("/api/clientes/import", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ data: fileContent }),
            })

            if (!response.ok) {
                throw new Error("Error al importar clientes")
            }

            const result = await response.json()
            setImportResult(result)

            // Recargar estadísticas
            loadStats()
        } catch (error) {
            console.error("Error:", error)
            setError("Error al importar clientes")
        } finally {
            setIsImporting(false)
        }
    }

    return (
        <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-background" >
            <div className="max-w-6xl mx-auto" >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6" >
                    <div>
                        <h1 className="text-3xl font-bold mb-2 text-foreground" > Dashboard de Clientes </h1>
                        < p className="text-muted-foreground" > Gestione y analice su base de datos de clientes </p>
                    </div>
                    < Link href="/clientes" >
                        <Button className="mt-4 sm:mt-0" >
                            <Users className="mr-2 h-4 w-4" />
                            Ver Listado de Clientes
                        </Button>
                    </Link>
                </div>

                < div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6" >
                    <Card>
                        <CardHeader className="pb-2" >
                            <CardTitle className="text-lg" > Total de Clientes </CardTitle>
                            < CardDescription > Clientes registrados en el sistema </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {
                                isLoading ? (
                                    <div className="flex items-center justify-center py-4" >
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="text-4xl font-bold" > {stats?.total || 0
                                    } </div>
                                )
                            }
                        </CardContent>
                    </Card>

                    < Card >
                        <CardHeader className="pb-2" >
                            <CardTitle className="text-lg" > Nuevos Clientes </CardTitle>
                            < CardDescription > Registrados en el último mes </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {
                                isLoading ? (
                                    <div className="flex items-center justify-center py-4" >
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="text-4xl font-bold" > {stats?.nuevosUltimoMes || 0
                                    } </div>
                                )}
                        </CardContent>
                    </Card>

                    < Card >
                        <CardHeader className="pb-2" >
                            <CardTitle className="text-lg" > Acciones Rápidas </CardTitle>
                            < CardDescription > Gestión de clientes </CardDescription>
                        </CardHeader>
                        < CardContent >
                            <div className="flex flex-col space-y-2" >
                                <Link href="/clientes/nuevo" >
                                    <Button variant="outline" className="w-full justify-start" >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Nuevo Cliente
                                    </Button>
                                </Link>
                                < Button variant="outline" className="w-full justify-start" onClick={handleExport} >
                                    <Download className="mr-2 h-4 w-4" />
                                    Exportar Clientes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                < Tabs defaultValue="stats" >
                    <TabsList className="grid w-full grid-cols-2 mb-6" >
                        <TabsTrigger value="stats" >
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Estadísticas
                        </TabsTrigger>
                        < TabsTrigger value="import" >
                            <Upload className="mr-2 h-4 w-4" />
                            Importar Datos
                        </TabsTrigger>
                    </TabsList>

                    < TabsContent value="stats" >
                        <Card>
                            <CardHeader>
                                <CardTitle>Distribución por Categoría </CardTitle>
                                < CardDescription > Clientes agrupados por categoría </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {
                                    isLoading ? (
                                        <div className="flex items-center justify-center py-8" >
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                        </div>
                                    ) : error ? (
                                        <Alert variant="destructive" >
                                            <AlertDescription>{error} </AlertDescription>
                                        </Alert>
                                    ) : stats && Object.keys(stats.porCategoria).length > 0 ? (
                                        <div className="space-y-4" >
                                            {
                                                Object.entries(stats.porCategoria).map(([categoria, cantidad]) => (
                                                    <div key={categoria} className="flex items-center justify-between" >
                                                        <div className="font-medium" > {categoria} </div>
                                                        < div className="flex items-center" >
                                                            <div className="mr-4" > {cantidad} </div>
                                                            < div className="w-40 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700" >
                                                                <div
                                                                    className="bg-primary h-2.5 rounded-full"
                                                                    style={{ width: `${(cantidad / stats.total) * 100}%` }}
                                                                > </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground" > No hay datos de categorías disponibles </div>
                                    )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    < TabsContent value="import" >
                        <Card>
                            <CardHeader>
                                <CardTitle>Importar Clientes </CardTitle>
                                < CardDescription > Importe clientes desde un archivo JSON </CardDescription>
                            </CardHeader>
                            < CardContent >
                                <div className="space-y-4" >
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center" >
                                        <input
                                            type="file"
                                            id="file-upload"
                                            className="hidden"
                                            accept=".json"
                                            onChange={handleFileChange}
                                            disabled={isImporting}
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center" >
                                            <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                            <p className="text-sm font-medium" >
                                                {importFile ? importFile.name : "Haga clic para seleccionar un archivo JSON"}
                                            </p>
                                            < p className="text-xs text-muted-foreground mt-1" >
                                                El archivo debe contener un array de objetos con los campos: nombre, telefono, email, direccion,
                                                etc.
                                            </p>
                                        </label>
                                    </div>

                                    {
                                        importFile && (
                                            <Button className="w-full" onClick={handleImport} disabled={isImporting || !importFile
                                            }>
                                                {
                                                    isImporting ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Importando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="mr-2 h-4 w-4" />
                                                            Importar Datos
                                                        </>
                                                    )}
                                            </Button>
                                        )}

                                    {
                                        importResult && (
                                            <Alert
                                                className={
                                                    importResult.success
                                                        ? "border-green-200 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                                        : "border-red-200 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                                }
                                            >
                                                <AlertDescription>
                                                    {
                                                        importResult.success
                                                            ? `Se importaron ${importResult.imported} clientes correctamente. ${importResult.errors > 0
                                                                ? `${importResult.errors} registros fueron omitidos debido a errores.`
                                                                : ""
                                                            }`
                                                            : "Error al importar clientes."
                                                    }
                                                </AlertDescription>
                                            </Alert>
                                        )
                                    }

                                    {
                                        error && (
                                            <Alert variant="destructive" >
                                                <AlertDescription>{error} </AlertDescription>
                                            </Alert>
                                        )
                                    }
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    )
}
