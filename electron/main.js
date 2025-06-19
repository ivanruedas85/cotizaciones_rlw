const { app, BrowserWindow, Menu, shell, dialog } = require("electron")
const path = require("path")
const isDev = process.env.NODE_ENV === "development"

// Mantener una referencia global del objeto ventana
let mainWindow

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
        },
        icon: path.join(__dirname, "../public/icon.png"),
        show: false,
        titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    })

    // Cargar la aplicación
    const startUrl = isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../.next/server/app/index.html")}`

    if (isDev) {
        mainWindow.loadURL(startUrl)
        // Abrir DevTools en desarrollo
        mainWindow.webContents.openDevTools()
    } else {
        // En producción, servir los archivos estáticos
        mainWindow.loadURL(`file://${path.join(__dirname, "../out/index.html")}`)
    }

    // Mostrar ventana cuando esté lista
    mainWindow.once("ready-to-show", () => {
        mainWindow.show()

        // Enfocar la ventana en macOS
        if (process.platform === "darwin") {
            mainWindow.focus()
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

        if (parsedUrl.origin !== startUrl) {
            event.preventDefault()
        }
    })
}

// Este método será llamado cuando Electron haya terminado la inicialización
app.whenReady().then(() => {
    createWindow()
    createMenu()

    app.on("activate", () => {
        // En macOS es común recrear una ventana cuando se hace clic en el icono del dock
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Salir cuando todas las ventanas estén cerradas, excepto en macOS
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
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
                            title: "Acerca de GestorVentas",
                            message: "GestorVentas v1.0.0",
                            detail:
                                "Sistema de Gestión de Ventas y Cotizaciones\n\nDesarrollado para optimizar la gestión de cotizaciones, inventario y análisis de ventas.",
                            buttons: ["OK"],
                        })
                    },
                },
                {
                    label: "Documentación",
                    click: () => {
                        shell.openExternal("https://github.com/ivanruedas85/cotizaciones_rlw")
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
                    role: "about",
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
    // Aquí puedes agregar lógica para actualizaciones automáticas
    console.log("GestorVentas Desktop iniciado correctamente")
})
