import { ipcMain } from 'electron'
import { userStore } from './user-store.js'

ipcMain.handle('setLocale', (_event, locale) => {
  userStore.set('locale', locale)
})
