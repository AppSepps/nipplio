'use strict'

import {app, BrowserWindow, globalShortcut, ipcMain, Menu, nativeImage, protocol, shell, Tray,} from 'electron'
import {autoUpdater} from 'electron-updater'
import path from 'path'
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib'
import installExtension, {VUEJS_DEVTOOLS} from 'electron-devtools-installer'
import bonjour from 'bonjour'
import Store from 'electron-store'
import windowStateKeeper from "electron-window-state";
import {update} from "firebase/database";

let mainWindowState

const isDevelopment = process.env.NODE_ENV !== 'production'

let willQuitApp = false
let tray = null
let win = null

const bonjourInstance = new bonjour()
let bonjourService

const store = new Store();
const OPEN_SHORTCUT = 'openShortcut'
if (!store.get(OPEN_SHORTCUT)) {
    store.set(OPEN_SHORTCUT, "CommandOrControl+Shift+P")
}

app.commandLine.appendSwitch('enable-experimental-web-platform-features')
app.commandLine.appendSwitch('enable-web-bluetooth')
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    {scheme: 'app', privileges: {secure: true, standard: true}},
])

let heartbeatTimestampMillis = new Date().valueOf();

const createTray = (currentlyCheckingForUpdates = false) => {
    const platform = process.platform
    let icon

    if(!tray) {
        if (platform === 'darwin' || platform === 'linux') {
            icon = path.join(__static, 'assets', '/icon_tray.png')
        } else if (platform === 'win32') {
            icon = path.join(__static, 'assets', '/icon.ico')
        }
        const trayImage = nativeImage.createFromPath(icon)
        tray = new Tray(trayImage)
    }

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                show()
            },
        },
        {
            label: currentlyCheckingForUpdates ? 'checking for update...' :'Check for Updates',
            enabled: !currentlyCheckingForUpdates,
            click: async () => {
                createTray(true)
                await autoUpdater.checkForUpdatesAndNotify()
                createTray(false)
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
            enabled: false,
        },
    ])

    tray.setContextMenu(contextMenu)
    tray.on('click', () => {
        tray.popUpContextMenu() // Weird double appearence bug with focus/blur
    })
}

const show = () => {
    win.show()
}

async function createWindow() {
    if (!tray) {
        createTray()
    }
    // Load the previous state with fallback to defaults
    mainWindowState = windowStateKeeper({
        defaultWidth: 1400,
        defaultHeight: 960
    });
    // Create the browser window.
    win = new BrowserWindow({
        userAgent: 'Chrome',
        backgroundColor: '#121212',
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        fullscreenable: true,
        skipTaskbar: false,
        show: false,
        maximizable: true,
        minimizable: true,
        hasShadow: false,
        icon: __dirname + '/icon.png',
        nativeWindowOpen: true,
        autoHideMenuBar: true,
        webPreferences: {
            backgroundThrottling: false,
            experimentalFeatures: true,
            nodeIntegration: true,
            contextIsolation: false,
            allowRunningInsecureContent: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    })
    mainWindowState.manage(win);
    win.setVisibleOnAllWorkspaces(true, {visibleOnFullScreen: true})

    win.webContents.on('select-bluetooth-device', (event, deviceList, callback) => {
        console.log("select-bluetooth-device")
        event.preventDefault()
        const result = deviceList.find((device) => {
            return device.deviceName === 'test'
        })
        if (!result) {
            callback('')
        } else {
            callback(result.deviceId)
        }
    })
    win.on('close', (e) => {
        console.log(win.getBounds())
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
    } catch (error) {
    }
    reregisterOpenShortcut()
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

    ipcMain.on('heartbeat', () => {
        console.log("received heartbeat")
        heartbeatTimestampMillis = new Date().valueOf()
    })
    // check every second if the last heartbeat is not older than 10 seconds. If so, reload the window
    setInterval(() => {
        if (heartbeatTimestampMillis <= new Date().valueOf()-10000) {
            heartbeatTimestampMillis = new Date().valueOf()
            console.log("heartbeat too old")
            win.reload()
        }
    }, 1000)

    ipcMain.on('changeOpenShortcut', (event, data) => {
        globalShortcut.unregister(store.get(OPEN_SHORTCUT))
        store.set(OPEN_SHORTCUT, data)
        reregisterOpenShortcut();
    })
    ipcMain.on('sendOpenShortcutToRenderer', () => {
        win.webContents.send('openShortcutRegistered', store.get(OPEN_SHORTCUT))
    })
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
        bonjourService = bonjourInstance.find(
            {type: 'nipplio'},
            function (service) {
                console.log('Found an Nipplio server:', service)
                win.webContents.send('discoveredNipplioDevice', service)
            }
        )
    })
    ipcMain.on('stopScanForDevices', () => {
        console.log('stop bonjourService')
        bonjourService.stop()
    })

    ipcMain.on('escPressed', () => {
        win.hide()
    })

    ipcMain.on('networkStatusOnline', () => {
       win.reload()
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

const reregisterOpenShortcut = () => {
    globalShortcut.register(store.get(OPEN_SHORTCUT), () => {
        onToggleWindowShortCut()
    })
    if (win != null) {
        win.webContents.send('openShortcutRegistered', store.get(OPEN_SHORTCUT))
    }
}

const onToggleWindowShortCut = () => {
    if (!win.isMinimized() && win.isVisible()) {
        win.hide()
    } else {
        win.webContents.send('clearSearchbarText')
        show()
    }
}

const onToggleSelfMuteShortCut = () => {
    win.webContents.send('mute')
}
