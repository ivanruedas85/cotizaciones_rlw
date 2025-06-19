const { contextBridge, ipcRenderer } = require("electron")

// Exponer APIs seguras al renderer process
contextBridge.exposeInMainWorld("electronAPI", {
    // Navegación
    navigate: (path) => ipcRenderer.send("navigate", path),

    // Exportar/Importar datos
    exportData: (callback) => ipcRenderer.on("export-data", callback),
    importData: (callback) => ipcRenderer.on("import-data", callback),

    // Información del sistema
    platform: process.platform,

    // Abrir enlaces externos
    openExternal: (url) => ipcRenderer.invoke("open-external", url),

    // APIs de actualización
    updater: {
        // Verificar actualizaciones manualmente
        checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),

        // Descargar actualización
        downloadUpdate: () => ipcRenderer.invoke("download-update"),

        // Instalar actualización y reiniciar
        quitAndInstall: () => ipcRenderer.invoke("quit-and-install"),

        // Obtener versión actual
        getAppVersion: () => ipcRenderer.invoke("get-app-version"),

        // Escuchar eventos de actualización
        onUpdateStatus: (callback) => ipcRenderer.on("update-status", callback),
        onDownloadProgress: (callback) => ipcRenderer.on("download-progress", callback),

        // Remover listeners
        removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
    },
})

