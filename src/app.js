import fs from 'fs'
import Vue from 'vue'
import VueChatScroll from 'vue-chat-scroll'
import { remote } from 'electron'
import { spawn } from 'child_process'
import { executablePath, getUserOptions, saveUserOptions } from './config'
import { ansiToHtml, configToOptions, getOutputPath, fixPath } from './utils'

import 'photon/dist/css/photon.css'
import './style.css'

Vue.use(VueChatScroll)

const app = new Vue({
  el: '#app',
  data: {
    inputPath: '',
    progressing: false,
    progress: 0,
    logText: '',
    config: Object.assign({
      dev: 'k2',
      om: 0.02,
      m: 0,
      ws: -0.2,
      as: true,
      wrap: true,
    }, getUserOptions())
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

      const win = remote.getCurrentWindow()
      const [w, h] = win.getSize()
      win.setSize(w, 800, true)
      win.center()

      let options = configToOptions(this.config)
      options = options.concat([
        '-x',
        '-y',
        '-o',
        fixPath(this.outputPath),
        fixPath(this.inputPath),
      ])

      let child = spawn(fixPath(executablePath), options, {shell: true})
      child.stdout.on('data', this.log.bind(this))
      child.stderr.on('data', this.log.bind(this))
      child.on('close', (code) => {
        if (code === 0) {
          saveUserOptions(this.config)
          remote.shell.showItemInFolder(this.outputPath)
        } else {
          remote.dialog.showErrorBox('Error', `k2pdfopt exited with code: ${code}`)
        }
      })
      child.stdin.write('\r\n')
    }
  }
})
