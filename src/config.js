import path from 'path'
import Config from 'electron-config'
import { remote } from 'electron'

const executableDir = remote.app.getPath('userData')
const executablePath = path.join(executableDir, 'k2pdfopt')

const config = new Config()


function getUserOptions() {
  return config.get('options') || {}
}

function saveUserOptions(options) {
  return config.set('options', options)
}


export { executableDir, executablePath, getUserOptions, saveUserOptions }
