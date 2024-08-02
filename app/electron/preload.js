const { ipcRenderer } = require('electron')
window.ipcRenderer = ipcRenderer

window.addEventListener('online', () => {
    window.ipcRenderer.send('networkStatusOnline')
})