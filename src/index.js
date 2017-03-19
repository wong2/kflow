import path from 'path'
import Vue from 'vue'
import VueChatScroll from 'vue-chat-scroll'
import { remote } from 'electron'
import { spawn } from 'child_process'
import Converter from 'ansi-to-html'
import fixPath from 'fix-path'

import 'photon/dist/css/photon.css'
import './style.css'


function ansiToHtml(s) {
  const converter = new Converter()
  let html = converter.toHtml(s)
  return html.trimLeft().replace(/(?:\r\n|\r|\n)/g, '<br />')
}

function getOutputPath(inputPath) {
  let ext = path.extname(inputPath)
  let basename = path.basename(inputPath, ext)
  let dir = path.dirname(inputPath)
  return path.join(dir, `${basename}_k2opt${ext}`)
}

function configToOptions(config) {
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

fixPath()
Vue.use(VueChatScroll)

const app = new Vue({
  el: '#app',
  data: {
    inputPath: '',
    progressing: false,
    progress: 0,
    logText: '',
    config: {
      dev: 'k2',
      om: 0.02,
      m: 0,
      ws: -0.2,
      as: true,
      wrap: true,
    }
  },
  computed: {
    progressText: function() {
      return (this.progress * 100) + '%'
    },
    outputPath: function() {
      if (!this.inputPath) {
        return ''
      }
      return getOutputPath(this.inputPath)
    }
  },
  methods: {
    selectInputFile: function() {
      remote.dialog.showOpenDialog({
        defaultPath: this.inputPath,
        filters: [
          {name: 'PDFs', extensions: ['pdf']}
        ],
        properties: ['openFile']
      }, (filePaths) => {
        if (filePaths) {
          this.inputPath = filePaths[0]
        }
      })
    },
    log: function(data) {
      let s = data.toString()
      let m = /SOURCE PAGE (\d+) of (\d+)/.exec(s)
      if (m) {
        this.progress = parseInt(m[1]) / parseInt(m[2])
      }
      this.logText += ansiToHtml(s)
    },
    convert: function() {
      if (!this.inputPath) {
        remote.dialog.showErrorBox('Error', 'no input pdf selected')
        return
      }
      this.logText = ''
      this.progress = 0
      this.progressing = true

      let options = configToOptions(this.config)
      options = options.concat([
        '-x',
        '-o',
        this.outputPath,
        this.inputPath,
      ])

      let child = spawn('k2pdfopt', options)
      child.stdout.on('data', this.log.bind(this))
      child.stderr.on('data', this.log.bind(this))
      child.on('close', (code) => {
        if (code === 0) {
          this.progressing = false
          remote.shell.showItemInFolder(this.outputPath)
        } else {
          remote.dialog.showErrorBox('Error', `k2pdfopt exited with code: ${code}`)
        }
      })
      child.stdin.write('\r\n')
    }
  }
})
