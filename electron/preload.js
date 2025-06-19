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
})
