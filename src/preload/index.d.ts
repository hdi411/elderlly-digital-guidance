import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      executeAction: (action: { type: string; params: Record<string, string> }) => Promise<{
        success: boolean
        message: string
      }>
    }
  }
}
