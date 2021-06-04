import {
  app,
  BrowserWindow,
  Menu,
  nativeImage,
  Tray,
  globalShortcut,
  screen,
} from 'electron'
import path from 'path'
import pkg from '../../package.json'

require('@electron/remote/main').initialize()

// set app name
app.name = pkg.productName
// to hide deprecation message
app.allowRendererProcessReuse = true

// disable electron warning
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = false

const gotTheLock = app.requestSingleInstanceLock()
const isDev = process.env.NODE_ENV === 'development'
const isDebug = process.argv.includes('--debug')

const WINDOW_WIDTH = 1280
const WINDOW_HEIGHT = 720

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

// only allow single instance of application
if (!isDev) {
  if (gotTheLock) {
    app.on('second-instance', () => {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow && mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
    })
  } else {
    app.quit()
    process.exit(0)
  }
} else {
  // process.env.ELECTRON_ENABLE_LOGGING = true

  require('electron-debug')({
    showDevTools: false,
  })
}

async function installDevTools() {
  let installExtension = require('electron-devtools-installer')
  installExtension.default(installExtension.VUEJS_DEVTOOLS).catch((err) => {
    console.log('Unable to install `vue-devtools`: \n', err)
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

function createWindow() {
  if (!tray) {
    createTray()
  }
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    backgroundColor: '#fff',
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
    // useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: false,
      contextIsolation: false,
      webSecurity: false,
    },
  })

  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  mainWindow.setAlwaysOnTop(true, 'floating')

  // load root file/url
  if (isDev) {
    mainWindow.loadURL('http://localhost:9080')
  } else {
    mainWindow.loadFile(`${__dirname}/index.html`)

    global.__static = require('path')
      .join(__dirname, '/static')
      .replace(/\\/g, '\\\\')
  }

  mainWindow.on('ready-to-show', () => {
    setTimeout(() => {
      show()
    }, 50)
  })
  mainWindow.on('close', (e) => {
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
