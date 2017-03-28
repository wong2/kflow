import { ipcRenderer } from 'electron'
import { Circle } from 'progressbar.js'

const bar = new Circle('#progress-circle', {
  color: '#aaa',
  trailWidth: 1,
  from: {color: '#79de9d'},
  to: {color: '#79de9d'},
  step: function(state, circle) {
    circle.path.setAttribute('stroke', state.color)
    let value = Math.round(circle.value() * 100)
    circle.setText(`${value}%`)
  }
})


ipcRenderer.on('updateProgress', (event, message) => {
  bar.animate(message)
})
