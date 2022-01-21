import { ipcRenderer } from 'electron'
window.ipcRenderer = ipcRenderer

window.addEventListener('online', () => {
    window.ipcRenderer.send('networkStatusOnline')
})