import path from 'path'
import Converter from 'ansi-to-html'

function ansiToHtml(s) {
  const converter = new Converter()
  let html = converter.toHtml(s)
  return html.trimLeft().replace(/(?:\r\n|\r|\n)/g, '<br />')
}

function configToOptions(config) {
  // convert config object to options array
  let options = []
  for (let [k, v] of Object.entries(config)) {
    if (typeof v == 'boolean') {
      if (v === true) {
        options.push(`-${k}`)
      }
    } else {
      options.push(`-${k}`)
      options.push(v)
    }
  }
  return options
}

function getOutputPath(inputPath) {
  let ext = path.extname(inputPath)
  let basename = path.basename(inputPath, ext)
  let dir = path.dirname(inputPath)
  return path.join(dir, `${basename}_k2opt${ext}`)
}

function fixPath(s) {
  return s.replace(/ /g, '\\ ')
}

export { ansiToHtml, configToOptions, getOutputPath, fixPath }
