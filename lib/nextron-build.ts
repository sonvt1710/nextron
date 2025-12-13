/* eslint-disable @typescript-eslint/no-unused-expressions */

import fs from 'fs-extra'
import path from 'path'
import { Command } from 'commander'
import chalk from 'chalk'
import { execa, Options } from 'execa'
import * as logger from './logger'
import { getNextronConfig } from './configs/getNextronConfig'
import { useExportCommand } from './configs/useExportCommand'

const cwd = process.cwd()
const appDir = path.join(cwd, 'app')
const distDir = path.join(cwd, 'dist')
const execaOptions: Options = {
  cwd,
  stdio: 'inherit',
}

type BuildCommandOptions = {
  mac: boolean
  linux: boolean
  win: boolean
  x64: boolean
  ia32: boolean
  armv7l: boolean
  arm64: boolean
  universal: boolean
  config: string
  publish: string
  noPack: boolean
}

export const buildCommand = new Command('build')

buildCommand
  .description('Build nextron')
  .option('--mac', '説明')
  .option('--linux', '説明')
  .option('--win', '説明')
  .option('--x64', '説明')
  .option('--ia32', '説明')
  .option('--armv7l', '説明')
  .option('--arm64', '説明')
  .option('--universal', '説明')
  .option('--config <string>', '説明')
  .option('--publish <string>', '説明')
  .option('--no-pack', '説明')
  .action(async (options: BuildCommandOptions) => {
    function createBuilderArgs() {
      const results = []

      if (options.config) {
        results.push('--config')
        results.push(options.config || 'electron-builder.yml')
      }

      if (options.publish) {
        results.push('--publish')
        results.push(options.publish)
      }

      options.mac && results.push('--mac')
      options.linux && results.push('--linux')
      options.win && results.push('--win')
      options.x64 && results.push('--x64')
      options.ia32 && results.push('--ia32')
      options.armv7l && results.push('--armv7l')
      options.arm64 && results.push('--arm64')
      options.universal && results.push('--universal')

      return results
    }

    const rendererSrcDir =
      (await getNextronConfig()).rendererSrcDir || 'renderer'
    // Ignore missing dependencies
    process.env.ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES = 'true'

    try {
      logger.info('Clearing previous builds')
      await Promise.all([fs.remove(appDir), fs.remove(distDir)])

      logger.info('Building renderer process')
      await execa(
        'next',
        ['build', path.join(cwd, rendererSrcDir)],
        execaOptions
      )
      if (await useExportCommand()) {
        await execa(
          'next',
          ['export', '-o', appDir, path.join(cwd, rendererSrcDir)],
          execaOptions
        )
      }

      logger.info('Building main process')
      await execa(
        'node',
        [path.join(import.meta.dirname, 'webpack.config.mjs')],
        execaOptions
      )

      if (options.noPack) {
        logger.info('Skip packaging...')
      } else {
        logger.info('Packaging - please wait a moment')
        await execa('electron-builder', createBuilderArgs(), execaOptions)
      }

      logger.info('See `dist` directory')
    } catch (err) {
      console.log(chalk`

{bold.red Cannot build electron packages:}
{bold.yellow ${err}}
`)
      process.exit(1)
    }
  })
