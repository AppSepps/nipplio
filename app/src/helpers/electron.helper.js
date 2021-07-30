export const sendToIPCRenderer = (
    key,
    data = undefined,
    errorCb = () => {}
) => {
    try {
        window.ipcRenderer.send(key, data)
    } catch (error) {
        // Mostly called in web instance
        errorCb(error)
    }
}
