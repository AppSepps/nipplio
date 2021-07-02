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
} from 'electron'
import path from 'path'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

const WINDOW_WIDTH = 960
const WINDOW_HEIGHT = 960

let tray = null
let win = null

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } },
])

const createTray = () => {
    const platform = process.platform
    let icon

    if (platform === 'darwin' || platform === 'linux') {
        icon = path.join(__static, 'assets', '/icon.png')
    } else if (platform === 'win32') {
        icon = path.join(__static, 'assets', '/icon.ico')
    }
    const trayImage = nativeImage.createFromPath(icon)
    tray = new Tray(trayImage.resize({ width: 16 }))
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                show()
            },
        },
        {
            label: 'Quit',
            click: () => {
                app.quit()
            },
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
        backgroundColor: '#121212',
        height: WINDOW_HEIGHT,
        width: WINDOW_WIDTH,
        maxHeight: WINDOW_HEIGHT,
        maxWidth: WINDOW_WIDTH,
        fullscreenable: false,
        skipTaskbar: true,
        show: false,
        maximizable: false,
        minimizable: false,
        hasShadow: false,
        icon: __dirname + '/icon.png',
        webPreferences: {
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
            contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
        },
    })

    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    win.setAlwaysOnTop(true, 'floating')

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
        // Load the index.html when not in development
        win.loadURL('app://./index.html')
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    app.dock.hide() // Maybe find solution for short jump on mac os bar
    globalShortcut.register('CommandOrControl+P', () => {
        onToggleWindowShortCut()
    })
    globalShortcut.register('CommandOrControl+Alt+O', () => {
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
})

app.on('will-quit', () => {
    globalShortcut.unregisterAll()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
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
    } else {
        show()
    }
}

const onToggleSelfMuteShortCut = () => {
    console.log('Trying to self mute')
}
