const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require("electron")
const { autoUpdater } = require("electron-updater")
const path = require("path")
const isDev = process.env.NODE_ENV === "development"

// Configuración del auto-updater
autoUpdater.checkForUpdatesAndNotify()
autoUpdater.autoDownload = false // No descargar automáticamente
autoUpdater.autoInstallOnAppQuit = true

// Mantener una referencia global del objeto ventana
let mainWindow

// Variables para el estado de actualización
let updateAvailable = false
let updateDownloaded = false

function createWindow() {
    // Crear la ventana del navegador
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: true,
            preload: path.join(__dirname, "preload.js"),
        },
        icon: path.join(__dirname, "../public/favicon.png"),
        show: false,
        titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    })

    // Cargar la aplicación
    const startUrl = isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../out/index.html")}`

    if (isDev) {
        mainWindow.loadURL(startUrl)
        // Abrir DevTools en desarrollo
        mainWindow.webContents.openDevTools()
    } else {
        // En producción, servir los archivos estáticos
        mainWindow.loadURL(startUrl)
    }

    // Mostrar ventana cuando esté lista
    mainWindow.once("ready-to-show", () => {
        mainWindow.show()

        // Enfocar la ventana en macOS
        if (process.platform === "darwin") {
            mainWindow.focus()
        }

        // Verificar actualizaciones después de mostrar la ventana
        if (!isDev) {
            setTimeout(() => {
                autoUpdater.checkForUpdatesAndNotify()
            }, 3000) // Esperar 3 segundos después de cargar
        }
    })

    // Manejar enlaces externos
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url)
        return { action: "deny" }
    })

    // Emitido cuando la ventana es cerrada
    mainWindow.on("closed", () => {
        mainWindow = null
    })

    // Prevenir navegación a URLs externas
    mainWindow.webContents.on("will-navigate", (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl)

        if (parsedUrl.origin !== startUrl && !navigationUrl.startsWith("file://")) {
            event.preventDefault()
        }
    })
}

// Configuración de eventos del auto-updater
function setupAutoUpdater() {
    // Verificando actualizaciones
    autoUpdater.on("checking-for-update", () => {
        console.log("Verificando actualizaciones...")
        sendStatusToWindow("Verificando actualizaciones...")
    })

    // Actualización disponible
    autoUpdater.on("update-available", (info) => {
        console.log("Actualización disponible:", info.version)
        updateAvailable = true

        const response = dialog.showMessageBoxSync(mainWindow, {
            type: "info",
            title: "Actualización Disponible",
            message: `Nueva versión disponible: ${info.version}`,
            detail: "¿Desea descargar e instalar la actualización ahora?",
            buttons: ["Descargar Ahora", "Descargar en Segundo Plano", "Más Tarde"],
            defaultId: 0,
            cancelId: 2,
        })

        if (response === 0) {
            // Descargar ahora
            autoUpdater.downloadUpdate()
            showDownloadProgress()
        } else if (response === 1) {
            // Descargar en segundo plano
            autoUpdater.downloadUpdate()
        }
        // Si es "Más Tarde", no hacer nada
    })

    // No hay actualizaciones disponibles
    autoUpdater.on("update-not-available", (info) => {
        console.log("No hay actualizaciones disponibles")
        sendStatusToWindow("La aplicación está actualizada")
    })

    // Error al verificar actualizaciones
    autoUpdater.on("error", (err) => {
        console.error("Error en auto-updater:", err)
        sendStatusToWindow("Error al verificar actualizaciones")

        dialog.showErrorBox("Error de Actualización", "Ocurrió un error al verificar las actualizaciones:\n" + err.message)
    })

    // Progreso de descarga
    autoUpdater.on("download-progress", (progressObj) => {
        let log_message = "Velocidad de descarga: " + progressObj.bytesPerSecond
        log_message = log_message + " - Descargado " + progressObj.percent + "%"
        log_message = log_message + " (" + progressObj.transferred + "/" + progressObj.total + ")"

        console.log(log_message)
        sendStatusToWindow(log_message)

        // Enviar progreso a la ventana si está visible
        if (mainWindow) {
            mainWindow.webContents.send("download-progress", {
                percent: Math.round(progressObj.percent),
                transferred: progressObj.transferred,
                total: progressObj.total,
                bytesPerSecond: progressObj.bytesPerSecond,
            })
        }
    })

    // Actualización descargada
    autoUpdater.on("update-downloaded", (info) => {
        console.log("Actualización descargada")
        updateDownloaded = true

        const response = dialog.showMessageBoxSync(mainWindow, {
            type: "info",
            title: "Actualización Lista",
            message: "La actualización se ha descargado correctamente",
            detail: "La aplicación se reiniciará para aplicar la actualización. ¿Desea reiniciar ahora?",
            buttons: ["Reiniciar Ahora", "Reiniciar al Cerrar"],
            defaultId: 0,
        })

        if (response === 0) {
            // Reiniciar ahora
            autoUpdater.quitAndInstall()
        }
        // Si es "Reiniciar al Cerrar", la actualización se aplicará al cerrar la app
    })
}

// Función para mostrar progreso de descarga
function showDownloadProgress() {
    const progressWindow = new BrowserWindow({
        width: 400,
        height: 200,
        parent: mainWindow,
        modal: true,
        show: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    })

    progressWindow.loadURL(`data:text/html;charset=utf-8,
    <html>
      <head>
        <title>Descargando Actualización</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; 
            padding: 20px; 
            background: #f5f5f5;
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 160px;
          }
          .progress-container {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .progress-bar {
            width: 100%;
            height: 20px;
            background: #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
          }
          .progress-fill {
            height: 100%;
            background: #4CAF50;
            width: 0%;
            transition: width 0.3s ease;
          }
          .status { 
            text-align: center; 
            margin: 10px 0;
            color: #666;
          }
          .percent {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            color: #333;
          }
        </style>
      </head>
      <body>
        <div class="progress-container">
          <div class="percent" id="percent">0%</div>
          <div class="progress-bar">
            <div class="progress-fill" id="progress"></div>
          </div>
          <div class="status" id="status">Iniciando descarga...</div>
        </div>
        <script>
          const { ipcRenderer } = require('electron');
          ipcRenderer.on('download-progress', (event, data) => {
            document.getElementById('percent').textContent = data.percent + '%';
            document.getElementById('progress').style.width = data.percent + '%';
            document.getElementById('status').textContent = 
              'Descargando... ' + Math.round(data.transferred / 1024 / 1024) + 'MB / ' + 
              Math.round(data.total / 1024 / 1024) + 'MB';
          });
        </script>
      </body>
    </html>
  `)

    progressWindow.once("ready-to-show", () => {
        progressWindow.show()
    })

    // Cerrar ventana de progreso cuando termine la descarga
    autoUpdater.once("update-downloaded", () => {
        progressWindow.close()
    })

    // Cerrar ventana si hay error
    autoUpdater.once("error", () => {
        progressWindow.close()
    })
}

// Enviar estado a la ventana principal
function sendStatusToWindow(text) {
    if (mainWindow) {
        mainWindow.webContents.send("update-status", text)
    }
}

// Este método será llamado cuando Electron haya terminado la inicialización
app.whenReady().then(() => {
    createWindow()
    createMenu()

    // Configurar auto-updater solo en producción
    if (!isDev) {
        setupAutoUpdater()
    }

    app.on("activate", () => {
        // En macOS es común recrear una ventana cuando se hace clic en el icono del dock
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Salir cuando todas las ventanas estén cerradas, excepto en macOS
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
})

// Manejar cierre de aplicación con actualización pendiente
app.on("before-quit", (event) => {
    if (updateDownloaded) {
        // Si hay una actualización descargada, aplicarla al cerrar
        autoUpdater.quitAndInstall()
    }
})

// IPC handlers para comunicación con el renderer
ipcMain.handle("check-for-updates", async () => {
    if (!isDev) {
        return await autoUpdater.checkForUpdates()
    }
    return null
})

ipcMain.handle("download-update", () => {
    if (!isDev && updateAvailable) {
        autoUpdater.downloadUpdate()
        return true
    }
    return false
})

ipcMain.handle("quit-and-install", () => {
    if (!isDev && updateDownloaded) {
        autoUpdater.quitAndInstall()
        return true
    }
    return false
})

ipcMain.handle("get-app-version", () => {
    return app.getVersion()
})

// Crear menú de la aplicación
function createMenu() {
    const template = [
        {
            label: "Archivo",
            submenu: [
                {
                    label: "Nueva Cotización",
                    accelerator: "CmdOrCtrl+N",
                    click: () => {
                        mainWindow.webContents.send("navigate", "/")
                    },
                },
                {
                    label: "Nuevo Cliente",
                    accelerator: "CmdOrCtrl+Shift+N",
                    click: () => {
                        mainWindow.webContents.send("navigate", "/clientes/nuevo")
                    },
                },
                { type: "separator" },
                {
                    label: "Salir",
                    accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
                    click: () => {
                        app.quit()
                    },
                },
            ],
        },
        {
            label: "Ver",
            submenu: [
                {
                    label: "Inicio",
                    accelerator: "CmdOrCtrl+H",
                    click: () => {
                        mainWindow.webContents.send("navigate", "/")
                    },
                },
                {
                    label: "Cotizaciones",
                    accelerator: "CmdOrCtrl+1",
                    click: () => {
                        mainWindow.webContents.send("navigate", "/cotizaciones")
                    },
                },
                {
                    label: "Clientes",
                    accelerator: "CmdOrCtrl+2",
                    click: () => {
                        mainWindow.webContents.send("navigate", "/clientes")
                    },
                },
                {
                    label: "Insumos",
                    accelerator: "CmdOrCtrl+3",
                    click: () => {
                        mainWindow.webContents.send("navigate", "/insumos")
                    },
                },
                {
                    label: "Dashboard",
                    accelerator: "CmdOrCtrl+4",
                    click: () => {
                        mainWindow.webContents.send("navigate", "/dashboard")
                    },
                },
                { type: "separator" },
                {
                    label: "Recargar",
                    accelerator: "CmdOrCtrl+R",
                    click: () => {
                        mainWindow.reload()
                    },
                },
                {
                    label: "Alternar Pantalla Completa",
                    accelerator: process.platform === "darwin" ? "Ctrl+Cmd+F" : "F11",
                    click: () => {
                        mainWindow.setFullScreen(!mainWindow.isFullScreen())
                    },
                },
            ],
        },
        {
            label: "Herramientas",
            submenu: [
                {
                    label: "Verificar Actualizaciones",
                    click: async () => {
                        if (isDev) {
                            dialog.showMessageBox(mainWindow, {
                                type: "info",
                                title: "Modo Desarrollo",
                                message: "Las actualizaciones no están disponibles en modo desarrollo",
                                buttons: ["OK"],
                            })
                            return
                        }

                        try {
                            const result = await autoUpdater.checkForUpdates()
                            if (!result || !result.updateInfo) {
                                dialog.showMessageBox(mainWindow, {
                                    type: "info",
                                    title: "Sin Actualizaciones",
                                    message: "No hay actualizaciones disponibles",
                                    detail: `Versión actual: ${app.getVersion()}`,
                                    buttons: ["OK"],
                                })
                            }
                        } catch (error) {
                            dialog.showErrorBox("Error", "No se pudo verificar las actualizaciones: " + error.message)
                        }
                    },
                },
                { type: "separator" },
                {
                    label: "Exportar Datos",
                    click: async () => {
                        const result = await dialog.showSaveDialog(mainWindow, {
                            title: "Exportar Datos",
                            defaultPath: "gestorventas-backup.json",
                            filters: [
                                { name: "JSON Files", extensions: ["json"] },
                                { name: "All Files", extensions: ["*"] },
                            ],
                        })

                        if (!result.canceled) {
                            mainWindow.webContents.send("export-data", result.filePath)
                        }
                    },
                },
                {
                    label: "Importar Datos",
                    click: async () => {
                        const result = await dialog.showOpenDialog(mainWindow, {
                            title: "Importar Datos",
                            filters: [
                                { name: "JSON Files", extensions: ["json"] },
                                { name: "All Files", extensions: ["*"] },
                            ],
                            properties: ["openFile"],
                        })

                        if (!result.canceled) {
                            mainWindow.webContents.send("import-data", result.filePaths[0])
                        }
                    },
                },
                { type: "separator" },
                {
                    label: "Herramientas de Desarrollador",
                    accelerator: process.platform === "darwin" ? "Alt+Cmd+I" : "Ctrl+Shift+I",
                    click: () => {
                        mainWindow.webContents.toggleDevTools()
                    },
                },
            ],
        },
        {
            label: "Ayuda",
            submenu: [
                {
                    label: "Acerca de GestorVentas",
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: "info",
                            title: "Acerca de cotizaciones_rlw",
                            message: `cotizaciones_rlw v${app.getVersion()}`,
                            detail:
                                "Sistema de Gestión Cotizaciones\n\nDesarrollado para optimizar la gestión de cotizaciones, inventario y análisis de ventas.\n\nActualizaciones automáticas habilitadas.",
                            buttons: ["OK"],
                        })
                    },
                },
                {
                    label: "Documentación",
                    click: () => {
                        shell.openExternal("https://github.com/ivanruedas85/cotizaciones_rlw/blob/master/README.md")
                    },
                },
                {
                    label: "Reportar Problema",
                    click: () => {
                        shell.openExternal("https://github.com/ivanruedas85/cotizaciones_rlw/issues")
                    },
                },
            ],
        },
    ]

    // Ajustes específicos para macOS
    if (process.platform === "darwin") {
        template.unshift({
            label: app.getName(),
            submenu: [
                {
                    label: "Acerca de " + app.getName(),
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: "info",
                            title: "Acerca de cotizaciones_rlw",
                            message: `cotizaciones_rlw v${app.getVersion()}`,
                            detail: "Sistema de Gestión Cotizaciones",
                            buttons: ["OK"],
                        })
                    },
                },
                { type: "separator" },
                {
                    label: "Verificar Actualizaciones...",
                    click: () => {
                        if (!isDev) {
                            autoUpdater.checkForUpdatesAndNotify()
                        }
                    },
                },
                { type: "separator" },
                {
                    label: "Servicios",
                    role: "services",
                    submenu: [],
                },
                { type: "separator" },
                {
                    label: "Ocultar " + app.getName(),
                    accelerator: "Command+H",
                    role: "hide",
                },
                {
                    label: "Ocultar Otros",
                    accelerator: "Command+Shift+H",
                    role: "hideothers",
                },
                {
                    label: "Mostrar Todo",
                    role: "unhide",
                },
                { type: "separator" },
                {
                    label: "Salir",
                    accelerator: "Command+Q",
                    click: () => app.quit(),
                },
            ],
        })
    }

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

// Manejar actualizaciones de la aplicación
app.on("ready", () => {
    console.log("cotizaciones_rlw Desktop iniciado correctamente")
    console.log("Versión:", app.getVersion())
    console.log("Modo desarrollo:", isDev)
})

