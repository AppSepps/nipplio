import { isElectron, sendToIPCRenderer } from './electron.helper'
import serial from './serial'

export const requestDevice = async function() {
    if (isElectron) {
        sendToIPCRenderer('autoConnectDeviceAndListenForChanges')
        return await new Promise((resolve, reject) => {
            window.ipcRenderer.once(
                'connectedToDevice',
                (event, device) => {
                    console.log('in connectedToDevice device', device)
                    resolve(device)
                },
                error => {
                    reject(error)
                }
            )
        })
    } else {
        const usbDevice = await navigator.usb.requestDevice({
            optionalServices: ['b06396cd-dfc3-495e-b33e-4a4c3b86389d'],
            filters: [
                {
                    vendorId: '9025',
                },
            ],
            // filters: [...] <- Prefer filters to save energy & show relevant devices.
        })
        return usbDevice
    }
}

export const connectToDeviceAndReceiveUpdates = async function(usbDevice, cb) {
    if (isElectron) {
        return null
    } else {
        const port = new serial.Port(usbDevice)
        port.connect().then(() => {
            port.onReceive = async data => {
                const slotId = new TextDecoder().decode(data)
                console.log(slotId)
                cb({
                    deviceId: usbDevice.serialNumber,
                    slotId,
                })
            }
        })
    }
}
