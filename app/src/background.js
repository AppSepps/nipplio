'use strict'

import {
    app,
    protocol,
    BrowserWindow,
    Menu,
    nativeImage,
    Tray,
    globalShortcut,
    screen,
    ipcMain,
    shell,
} from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import bonjour from 'bonjour'

const isDevelopment = process.env.NODE_ENV !== 'production'

const WINDOW_WIDTH = 1400
const WINDOW_HEIGHT = 960

let willQuitApp = false
let tray = null
let win = null

const bonjourInstance = new bonjour()
var bonjourService

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } },
])

const createTray = () => {
    const platform = process.platform
    let icon

    if (platform === 'darwin' || platform === 'linux') {
        icon = path.join(__static, 'assets', '/trayUnmuteTemplate.png')
    } else if (platform === 'win32') {
        icon = path.join(__static, 'assets', '/icon.ico')
    }
    const trayImage = nativeImage.createFromPath(icon)
    tray = new Tray(trayImage)
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                show()
            },
        },
        {
            label: 'Check for Updates',
            click: () => {
                autoUpdater.checkForUpdatesAndNotify()
            },
        },
        {
            label: 'Quit',
            click: () => {
                app.quit()
            },
        },
        {
            label: `Version: ${app.getVersion()}`,
            enabled: false
        },
    ])

    tray.setContextMenu(contextMenu)
    tray.on('click', () => {
        tray.popUpContextMenu() // Weird double appearence bug with focus/blur
    })
}

const show = () => {
    const currentScreen = screen.getDisplayNearestPoint(
        screen.getCursorScreenPoint()
    )
    let bounds = currentScreen.bounds
    let x = Math.ceil(bounds.x + (bounds.width - WINDOW_WIDTH) / 2)
    let y = Math.ceil(bounds.y + (bounds.height - WINDOW_HEIGHT) / 2)
    const newBounds = {
        x,
        y,
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
    }
    win.setBounds(newBounds)
    win.show()
}

async function createWindow() {
    if (!tray) {
        createTray()
    }
    // Create the browser window.
    win = new BrowserWindow({
        userAgent: 'Chrome',
        backgroundColor: '#121212',
        height: WINDOW_HEIGHT,
        width: WINDOW_WIDTH,
        fullscreenable: false,
        skipTaskbar: true,
        show: false,
        maximizable: false,
        minimizable: false,
        hasShadow: false,
        icon: __dirname + '/icon.png',
        nativeWindowOpen: true,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            allowRunningInsecureContent: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    })
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    win.setAlwaysOnTop(true, 'floating')

    win.on('close', e => {
        if (willQuitApp) {
            /* the user tried to quit the app */
            win = null
        } else {
            /* the user only tried to close the window */
            e.preventDefault()
            win.hide()
        }
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        console.log('is WEBPACK_DEV_SERVER_URL')
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL, {
            userAgent: 'Chrome',
        })
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
        // Load the index.html when not in development
        win.loadURL('https://nipplio.web.app')
        //win.loadURL('app://./index.html')
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    try {
        app.dock.hide() // Maybe find solution for short jump on mac os bar
    } catch (error) { }
    globalShortcut.register('CommandOrControl+P', () => {
        onToggleWindowShortCut()
    })

    globalShortcut.register('CommandOrControl+Shift+S', () => {
        onToggleSelfMuteShortCut()
    })
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            await installExtension(VUEJS_DEVTOOLS)
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    }
    createWindow()
    autoUpdater.checkForUpdatesAndNotify()

    ipcMain.on('fromWebToElectron', () => {
        console.log('fromWebToElectron')
    })
    ipcMain.on('openExternalBrowser', (event, data) => {
        shell.openExternal(data)
    })
    ipcMain.on('setIconToMute', () => {
        const trayImage = nativeImage.createFromPath(
            path.join(__static, 'assets', '/trayMuteTemplate.png')
        )
        tray.setImage(trayImage)
    })
    ipcMain.on('setIconToUnmute', () => {
        const trayImage = nativeImage.createFromPath(
            path.join(__static, 'assets', '/trayUnmuteTemplate.png')
        )
        tray.setImage(trayImage)
    })
    ipcMain.on('startScanForDevices', () => {
        bonjourService = bonjourInstance.find({ type: 'nipplio' }, function (
            service
        ) {
            console.log('Found an Nipplio server:', service)
            win.webContents.send('discoveredNipplioDevice', service)
        })
    })
    ipcMain.on('stopScanForDevices', () => {
        console.log('stop bonjourService')
        bonjourService.stop()
    })

    if (!isDevelopment) {
        app.setLoginItemSettings({
            openAtLogin: true,
        })
    }
})

app.on('will-quit', () => {
    globalShortcut.unregisterAll()
})

/* 'before-quit' is emitted when Electron receives
 * the signal to exit and wants to start closing windows */
app.on('before-quit', () => (willQuitApp = true))

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', data => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}

const onToggleWindowShortCut = () => {
    if (win.isVisible()) {
        win.hide()
        globalShortcut.unregister('Esc')
    } else {
        show()
        globalShortcut.register('Esc', () => {
            win.hide()
            globalShortcut.unregister('Esc')
        })
    }
}

const onToggleSelfMuteShortCut = () => {
    win.webContents.send('mute')
}
