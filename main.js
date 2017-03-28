const fs = require('fs')
const os = require('os')
const path = require('path')
const sleep = require('sleep-promise')
const electron = require('electron')
const { download } = require('electron-dl')

const app = electron.app

require('electron-debug')()

// prevent window being garbage collected
let mainWindow

function onClosed() {
  mainWindow = null
}


app.on('window-all-closed', () => {
  app.quit()
})


function createWindow(url, width, height) {
  const win = new electron.BrowserWindow({
    width: width,
    height: height,
    frame: false,
    resizable: false,
    movable: true
  })
  win.loadURL(url)
  win.on('closed', onClosed)
  return win
}

function createAppWindow() {
  return createWindow(`file://${__dirname}/index.html`, 900, 600)
}


const URLS_BY_PLATFORM = {
  'win32-x86': 'http://doora.qiniudn.com/k2pdfopt-win-32.exe',
  'win32-x64': 'http://doora.qiniudn.com/k2pdfopt-win-64.exe',
  'linux-x32': 'http://doora.qiniudn.com/k2pdfopt-linux-32',
  'linux-x64': 'http://doora.qiniudn.com/k2pdfopt-linux-64',
  'darwin-x32': 'http://doora.qiniudn.com/k2pdfopt-mac-32',
  'darwin-x64': 'http://doora.qiniudn.com/k2pdfopt-mac-64',
}

function getBinaryDownloadUrl() {
  return URLS_BY_PLATFORM[`${os.platform()}-${os.arch()}`]
}

function createDownloadWindow() {
  let win = createWindow(`file://${__dirname}/download.html`, 500, 400)
  const url = getBinaryDownloadUrl()
  if (!url) {
    electron.dialog.showErrorBox('Error', 'Sorry, your platform is not supported')
    return
  }
  win.webContents.on('did-finish-load', () => {
    download(win, url, {
      directory: executableDir,
      filename: 'k2pdfopt',
      onProgress: (progress) => {
        console.log('Download progress: ', progress)
        win.webContents.send('updateProgress', progress)
      }
    })
    .then(() => sleep(1000))
    .then(() => {
      // make it executable
      fs.chmodSync(executablePath, 755)
      console.log('Downloaded, restart the app')
      app.relaunch()
      app.exit(0)
    })
  })
  return win
}

const executableDir = app.getPath('userData')
const executablePath = path.join(executableDir, 'k2pdfopt')

console.log('k2pdfopt path: ', executablePath)

app.on('ready', () => {
  if (fs.existsSync(executablePath)) {
    mainWindow = createAppWindow()
  } else {
    mainWindow = createDownloadWindow()
  }
})
