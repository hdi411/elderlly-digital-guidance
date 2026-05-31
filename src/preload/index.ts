import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

contextBridge.exposeInMainWorld('electron', electronAPI)

contextBridge.exposeInMainWorld('api', {
  executeAction: (action: object) =>
    ipcRenderer.invoke('execute-action', action)
})
