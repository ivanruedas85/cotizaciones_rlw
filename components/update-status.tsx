"use client"

import { useState, useEffect } from "react"
import { Glass } from "./ui/glass"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressDemo } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Download, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"

declare global {
    interface Window {
        electronAPI?: {
            updater: {
                checkForUpdates: () => Promise<any>
                downloadUpdate: () => Promise<boolean>
                quitAndInstall: () => Promise<boolean>
                getAppVersion: () => Promise<string>
                onUpdateStatus: (callback: (event: any, status: string) => void) => void
                onDownloadProgress: (callback: (event: any, progress: any) => void) => void
                removeAllListeners: (channel: string) => void
            }
        }
    }
}

export function UpdateStatus() {
    const [isElectron, setIsElectron] = useState(false)
    const [version, setVersion] = useState("")
    const [updateStatus, setUpdateStatus] = useState("")
    const [downloadProgress, setDownloadProgress] = useState(0)
    const [isChecking, setIsChecking] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)

    useEffect(() => {
        // Verificar si estamos en Electron
        if (typeof window !== "undefined" && window.electronAPI) {
            setIsElectron(true)

            // Obtener versión actual
            window.electronAPI.updater.getAppVersion().then(setVersion)

            // Configurar listeners
            window.electronAPI.updater.onUpdateStatus((event, status) => {
                setUpdateStatus(status)
                setIsChecking(false)

                if (status.includes("Descargando")) {
                    setIsDownloading(true)
                } else {
                    setIsDownloading(false)
                }
            })

            window.electronAPI.updater.onDownloadProgress((event, progress) => {
                setDownloadProgress(progress.percent)
            })

            // Cleanup
            return () => {
                window.electronAPI?.updater.removeAllListeners("update-status")
                window.electronAPI?.updater.removeAllListeners("download-progress")
            }
        }
    }, [])

    const handleCheckForUpdates = async () => {
        if (!window.electronAPI) return

        setIsChecking(true)
        setUpdateStatus("Verificando actualizaciones...")

        try {
            await window.electronAPI.updater.checkForUpdates()
        } catch (error) {
            setUpdateStatus("Error al verificar actualizaciones")
            setIsChecking(false)
        }
    }

    const handleDownloadUpdate = async () => {
        if (!window.electronAPI) return

        const success = await window.electronAPI.updater.downloadUpdate()
        if (success) {
            setIsDownloading(true)
            setUpdateStatus("Descargando actualización...")
        }
    }

    const handleInstallUpdate = async () => {
        if (!window.electronAPI) return

        await window.electronAPI.updater.quitAndInstall()
    }

    // No mostrar el componente si no estamos en Electron
    if (!isElectron) {
        return null
    }

    return (
        <Glass className="w-full max-w-md" blur="lg" opacity={0.15}>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Actualizaciones
                </CardTitle>
                <CardDescription>
                    Versión actual: <Badge variant="outline">{version}</Badge>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {updateStatus && (
                    <div className="flex items-center space-x-2">
                        {updateStatus.includes("Error") ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : updateStatus.includes("actualizada") ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                            <RefreshCw className="h-4 w-4 text-blue-500" />
                        )}
                        <span className="text-sm">{updateStatus}</span>
                    </div>
                )}

                {isDownloading && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Descargando...</span>
                            <span>{downloadProgress}%</span>
                        </div>
                        <ProgressDemo value={downloadProgress} className="w-full" />
                    </div>
                )}

                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCheckForUpdates}
                        disabled={isChecking || isDownloading}
                        className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                    >
                        {isChecking ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        Verificar
                    </Button>

                    {updateStatus.includes("disponible") && (
                        <Button size="sm" onClick={handleDownloadUpdate} disabled={isDownloading} className="flex-1">
                            <Download className="mr-2 h-4 w-4" />
                            Descargar
                        </Button>
                    )}

                    {updateStatus.includes("descargada") && (
                        <Button size="sm" onClick={handleInstallUpdate} className="flex-1">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Instalar
                        </Button>
                    )}
                </div>
            </CardContent>
        </Glass>
    )
}
