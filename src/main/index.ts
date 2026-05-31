import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { exec } from 'child_process'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    show: false,
    title: 'AI Guidance for Elderly',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.elderly.guidance')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ── Helper to run shell commands ───────────────────────────────────
function run(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) reject(stderr || error.message)
      else resolve(stdout)
    })
  })
}

// ── IPC: Execute Action ────────────────────────────────────────────
ipcMain.handle('execute-action', async (_event, action) => {
  const { type, params } = action

  try {
    switch (type) {

      // 📞 Phone / FaceTime call
      case 'call': {
        const phone = params.phone || ''
        if (phone) {
          await run(`open "facetime-audio://${phone}"`)
          return { success: true, message: `Calling ${params.name || phone}...` }
        }
        await run(`open -a FaceTime`)
        return { success: true, message: 'Opening FaceTime...' }
      }

      // 📹 FaceTime video call
      case 'video_call': {
        const phone = params.phone || ''
        if (phone) {
          await run(`open "facetime://${phone}"`)
          return { success: true, message: `Starting video call with ${params.name || phone}...` }
        }
        await run(`open -a FaceTime`)
        return { success: true, message: 'Opening FaceTime...' }
      }

      // 🗺️ Navigation
      case 'navigate': {
        const dest = encodeURIComponent(params.destination || '')
        await run(`open "https://maps.google.com/?q=${dest}&dirflg=d"`)
        return { success: true, message: `Opening directions to ${params.destination}...` }
      }

      // 🔍 Google search
      case 'search': {
        const q = encodeURIComponent(params.query || '')
        await run(`open "https://www.google.com/search?q=${q}"`)
        return { success: true, message: `Searching for "${params.query}"...` }
      }

      // ✉️ Email
      case 'email': {
        await run(`open -a Mail`)
        return { success: true, message: 'Opening Mail app...' }
      }

      // 💬 Text message
      case 'text': {
        const phone = params.phone || ''
        if (phone) {
          await run(`open "sms://${phone}"`)
          return { success: true, message: `Opening Messages to ${params.name || phone}...` }
        }
        await run(`open -a Messages`)
        return { success: true, message: 'Opening Messages...' }
      }

      // 💬 WhatsApp / WeChat
      case 'whatsapp': {
        await run(`open "https://web.whatsapp.com"`)
        return { success: true, message: 'Opening WhatsApp...' }
      }

      case 'wechat': {
        await run(`open -a WeChat`).catch(() => run(`open "https://web.wechat.com"`))
        return { success: true, message: 'Opening WeChat...' }
      }

      // 🛒 Shopping
      case 'buy': {
        const q = encodeURIComponent(params.query || '')
        await run(`open "https://www.amazon.com/s?k=${q}"`)
        return { success: true, message: `Opening Amazon to search "${params.query}"...` }
      }

      // 📷 Camera / Photo Booth
      case 'photo': {
        await run(`open -a "Photo Booth"`)
        return { success: true, message: 'Opening camera...' }
      }

      // 📸 Photos
      case 'photos': {
        await run(`open -a Photos`)
        return { success: true, message: 'Opening your photos...' }
      }

      // 📰 News
      case 'news': {
        await run(`open "https://news.google.com"`)
        return { success: true, message: 'Opening Google News...' }
      }

      // ⬇️ App Store
      case 'download': {
        await run(`open -a "App Store"`)
        return { success: true, message: 'Opening App Store...' }
      }

      // 💳 Pay / Wallet
      case 'pay': {
        await run(`open -a Wallet`).catch(() => run(`open "https://wallet.apple.com"`))
        return { success: true, message: 'Opening Wallet...' }
      }

      // 🌤️ Weather
      case 'weather': {
        await run(`open "https://weather.com"`)
        return { success: true, message: 'Opening Weather...' }
      }

      // 📅 Calendar
      case 'calendar': {
        await run(`open -a Calendar`)
        return { success: true, message: 'Opening Calendar...' }
      }

      // 🎵 Music
      case 'music': {
        const q = params.query ? encodeURIComponent(params.query) : ''
        if (q) {
          await run(`open "https://music.youtube.com/search?q=${q}"`)
          return { success: true, message: `Playing "${params.query}"...` }
        }
        await run(`open -a Music`)
        return { success: true, message: 'Opening Music...' }
      }

      // 📺 YouTube
      case 'youtube': {
        const q = encodeURIComponent(params.query || '')
        await run(`open "https://www.youtube.com/results?search_query=${q}"`)
        return { success: true, message: `Searching YouTube for "${params.query}"...` }
      }

      // 🏥 Find hospital / pharmacy
      case 'hospital': {
        const q = encodeURIComponent('hospital near me')
        await run(`open "https://maps.google.com/?q=${q}"`)
        return { success: true, message: 'Finding nearby hospitals...' }
      }

      case 'pharmacy': {
        const q = encodeURIComponent('pharmacy near me')
        await run(`open "https://maps.google.com/?q=${q}"`)
        return { success: true, message: 'Finding nearby pharmacies...' }
      }

      // 💊 Reminder
      case 'reminder': {
        await run(`open -a Reminders`)
        return { success: true, message: 'Opening Reminders to set an alert...' }
      }

      // 🌐 Translate
      case 'translate': {
        const q = encodeURIComponent(params.query || '')
        await run(`open "https://translate.google.com/?text=${q}"`)
        return { success: true, message: 'Opening Google Translate...' }
      }

      // 🚕 Taxi / Uber
      case 'taxi': {
        await run(`open "https://m.uber.com"`)
        return { success: true, message: 'Opening Uber...' }
      }

      // 🆘 Emergency
      case 'emergency': {
        await run(`open "facetime-audio://911"`)
        return { success: true, message: '🆘 Calling Emergency Services (911)...' }
      }

      default:
        return { success: false, message: `Unknown action: ${type}` }
    }
  } catch (err) {
    return { success: false, message: String(err) }
  }
})
