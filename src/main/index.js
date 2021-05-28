import {
    app,
    BrowserWindow,
    globalShortcut,
    Menu,
    nativeImage,
    Tray,
    screen,
} from 'electron'
import path from 'path'
import '../renderer/store'

if (process.env.NODE_ENV !== 'development') {
    global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const WINDOW_WIDTH = 1280
const WINDOW_HEIGHT = 720
const winURL =
    process.env.NODE_ENV === 'development'
        ? `http://localhost:9080`
        : `file://${__dirname}/index.html`

let forceClose = false
let tray = null
let mainWindow = null

const createTray = () => {
    const platform = process.platform
    let icon

    if (platform === 'darwin' || platform === 'linux') {
        icon = path.join(__dirname, 'assets', '/icon.png')
    } else if (platform === 'win32') {
        icon = path.join(__dirname, 'assets', '/icon.ico')
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
                forceClose = true
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
    mainWindow.setBounds(newBounds)
    mainWindow.show()
}

const createWindow = () => {
    if (!tray) {
        createTray()
    }

    mainWindow = new BrowserWindow({
        height: WINDOW_HEIGHT,
        width: WINDOW_WIDTH,
        maxHeight: WINDOW_HEIGHT,
        maxWidth: WINDOW_WIDTH,
        fullscreenable: false,
        skipTaskbar: true,
        show: false,
        maximizable: false,
        minimizable: false,
        frame: false,
        hasShadow: false,
        icon: __dirname + '/icon.png',
        webPreferences: {
            nodeIntegration: true,
        },
    })

    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    mainWindow.setAlwaysOnTop(true, 'floating')
    mainWindow.loadURL(winURL)
    mainWindow.on('ready-to-show', () => {
        setTimeout(() => {
            show()
        }, 50)
    })
    mainWindow.on('close', (e) => {
        mainWindow.hide()
        return
        if (!forceClose) {
            // Catch CMD + Q
            e.preventDefault()
            mainWindow.hide()
        }
        forceClose = false
    })
    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

app.on('ready', () => {
    app.dock.hide() // Maybe find solution for short jump on mac os bar
    globalShortcut.register('CommandOrControl+P', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide()
        } else {
            show()
        }
    })

    createWindow()
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
autoUpdater.quitAndInstall()
})

app.on('ready', () => {
if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
*/
