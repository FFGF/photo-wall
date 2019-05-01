import { app, BrowserWindow, Menu, ipcMain } from 'electron'
const os = require('os')
const path = require('path')
const fs = require('fs')
const contextMenu = require('electron-context-menu')
import pkg from '../../package.json'

if (process.platform === 'win32') {
  app.setAppUserModelId(pkg.build.appId)
}

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
if(!fs.existsSync(path.join(os.homedir(), '/photo-wall'))){
  fs.mkdirSync((path.join(os.homedir(), '/photo-wall')))
}
// global.__photoWall = path.join(path.join(os.homedir(), '/photo-wall'))

if(process.env.NODE_ENV === 'development'){
  // contextMenu({
  //   showInspectElement: true
  // })
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    frame: true,
    webPreferences: { webSecurity: false }
  })

  mainWindow.loadURL(winURL)


  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
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
