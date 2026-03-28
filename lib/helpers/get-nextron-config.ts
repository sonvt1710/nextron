import fs from 'fs'
import path from 'path'
import { loadScript } from './load-script'
import type { NextronConfig } from '../../types'

const cwd = process.cwd()

const supportedConfigs = [
  'nextron.config.ts',
  'nextron.config.js',
  'nextron.config.mts',
  'nextron.config.mjs',
]

export const getNextronConfig = async (): Promise<NextronConfig> => {
  for (const config of supportedConfigs) {
    const configPath = path.join(cwd, config)
    if (fs.existsSync(configPath)) {
      return loadScript(configPath)
    }
  }

  return {}
}
