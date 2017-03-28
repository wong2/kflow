import path from 'path'
import { remote } from 'electron'

const executableDir = remote.app.getPath('userData')
const executablePath = path.join(executableDir, 'k2pdfopt')

export { executableDir, executablePath }
