import { getNextConfig } from './get-next-config'
import * as logger from '../logger'

export const checkNextConfig = async (): Promise<void> => {
  const { output, distDir } = await getNextConfig()

  if (output !== 'export') {
    logger.error(
      'We must export static files so as Electron can handle them. Please set `next.config.js#output` to `export`.'
    )
    process.exit(1)
  }

  if (process.env.NODE_ENV === 'production' && distDir !== '../app') {
    logger.error(
      'Nextron exports the build results to `app` directory, so please set `distDir` to `../app` in the `next.config.js`.'
    )
    process.exit(1)
  }
}
