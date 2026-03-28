import fs from 'fs'
import path from 'path'

const cwd = process.cwd()

const supportedConfigs = [
  '.babelrc',
  '.babelrc.js',
  'babel.config.js',
  'babel.config.ts',
]

export const getBabelPath = (): string => {
  for (const config of supportedConfigs) {
    const configPath = path.join(cwd, config)
    if (fs.existsSync(configPath)) {
      return configPath
    }
  }

  // fallback: nextron default babel config
  return path.join(import.meta.dirname, '../babel.js')
}
