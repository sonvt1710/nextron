import { Command } from 'commander'
import { $ } from 'execa'
import webpack from 'webpack'
import { waitForPort } from 'get-port-please'
import * as logger from './logger'
import { getNextronConfig } from './helpers/get-nextron-config'
import { getMainConfig } from './webpack/development/get-main-config'
import { getPreloadConfig } from './webpack/development/get-preload-config'
import type { ChildProcess } from 'child_process'

const $$ = $({ cwd: process.cwd(), stdio: 'inherit' })

type DevCommandOptions = {
  rendererPort: number
  startupDelay: number
  electronOptions: string
  runOnly: boolean
}

export const devCommand = new Command('dev')

devCommand
  .option('--renderer-port <number>')
  .option('--startup-delay <number>')
  .option('--electron-options <string>')
  .option('--run-only')
  .action(async (options: DevCommandOptions) => {
    const rendererPort = options.rendererPort || 8888
    let electronOptions = options.electronOptions || ''
    if (!electronOptions.includes('--remote-debugging-port')) {
      electronOptions += ' --remote-debugging-port=5858'
    }
    if (!electronOptions.includes('--inspect')) {
      electronOptions += ' --inspect=9292'
    }
    electronOptions = electronOptions.trim()

    const nextronConfig = await getNextronConfig()
    const startupDelay = nextronConfig.startupDelay || options.startupDelay || 0

    let firstCompile = true
    let watchingMain: webpack.Watching | undefined
    let watchingPreload: webpack.Watching | undefined
    let mainProcess: ChildProcess
    let rendererProcess: ChildProcess // eslint-disable-line prefer-const

    const startMainProcess = () => {
      logger.info(
        `Run main process: electron . ${rendererPort} ${electronOptions}`
      )
      mainProcess = $$(
        'electron',
        ['.', `${rendererPort}`, ...electronOptions.split(' ')],
        { detached: true }
      )
      mainProcess.unref()
    }

    const startRendererProcess = () => {
      logger.info(
        `Run renderer process: next dev -p ${rendererPort} ${
          nextronConfig.rendererSrcDir || 'renderer'
        }`
      )
      const child = $$('next', [
        'dev',
        '-p',
        String(rendererPort),
        nextronConfig.rendererSrcDir || 'renderer',
      ])
      child.on('close', () => {
        process.exit(0)
      })
      return child
    }

    const killWholeProcess = () => {
      if (watchingMain) {
        watchingMain.close(() => {})
      }
      if (watchingPreload) {
        watchingPreload.close(() => {})
      }
      if (mainProcess) {
        mainProcess.kill()
      }
      if (rendererProcess) {
        rendererProcess.kill()
      }
    }

    process.on('SIGINT', killWholeProcess)
    process.on('SIGTERM', killWholeProcess)
    process.on('exit', killWholeProcess)

    rendererProcess = startRendererProcess()

    // wait until renderer process is ready
    await waitForPort(rendererPort, {
      delay: 500,
      retries: startupDelay / 500,
    }).catch(() => {
      logger.error(
        `Failed to start renderer process with port ${rendererPort} in ${startupDelay}ms`
      )
      killWholeProcess()
      process.exit(1)
    })

    const mainConfig = await getMainConfig()
    const preloadConfig = await getPreloadConfig()

    // build preload script before starting main process
    await new Promise<void>((resolve) => {
      watchingPreload = webpack(preloadConfig).watch({}, (error) => {
        if (error) {
          console.error(error.stack || error)
        }
        resolve()
      })
    })

    // wait until main process is ready
    await new Promise<void>((resolve) => {
      watchingMain = webpack(mainConfig).watch({}, (error) => {
        if (error) {
          console.error(error.stack || error)
        }

        if (!options.runOnly) {
          if (!firstCompile && mainProcess) {
            mainProcess.kill()
          }
          startMainProcess()

          if (firstCompile) {
            firstCompile = false
          }
        }

        resolve()
      })
    })

    if (options.runOnly) {
      startMainProcess()
    }
  })
