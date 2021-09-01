import { ipcRenderer } from 'electron'
window.ipcRenderer = ipcRenderer

window.addEventListener('DOMContentLoaded', () => {
    new customTitlebar.Titlebar({
        backgroundColor: customTitlebar.Color.fromHex('#2f3241'),
    });


    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type])
    }
})