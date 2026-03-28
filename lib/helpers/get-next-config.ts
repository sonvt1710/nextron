import fs from 'fs'
import path from 'path'
import { getNextronConfig } from './get-nextron-config'
import { loadScript } from './load-script'

const cwd = process.cwd()

const supportedConfigs = [
  'next.config.ts',
  'next.config.js',
  'next.config.mts',
  'next.config.mjs',
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getNextConfig = async (): Promise<any> => {
  const rendererSrcDir = (await getNextronConfig()).rendererSrcDir || 'renderer'

  for (const config of supportedConfigs) {
    const configPath = path.join(cwd, rendererSrcDir, config)
    if (fs.existsSync(configPath)) {
      return loadScript(configPath)
    }
  }

  return {}
}
