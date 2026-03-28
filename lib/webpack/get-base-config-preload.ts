import fs from 'fs'
import path from 'path'
import webpack from 'webpack'
import TsconfigPathsPlugins from 'tsconfig-paths-webpack-plugin'
import { isTs, ext, externals } from '../helpers/get-project-settings'
import { getNextronConfig } from '../helpers/get-nextron-config'
import { getBabelPath } from '../helpers/get-babel-path'

const cwd = process.cwd()

export const getBaseConfigPreload =
  async (): Promise<webpack.Configuration> => {
    const { mainSrcDir } = await getNextronConfig()

    const preloadPath = path.join(cwd, mainSrcDir || 'main', `preload${ext}`)
    if (!fs.existsSync(preloadPath)) {
      return {}
    }

    const config: webpack.Configuration = {
      target: 'electron-preload',
      entry: {
        preload: preloadPath,
      },
      output: {
        filename: '[name].js',
        path: path.join(cwd, 'app'),
        library: {
          type: 'umd',
        },
      },
      externals: [...Object.keys(externals || {})],
      module: {
        rules: [
          {
            test: /\.(js|ts)x?$/,
            use: {
              loader: require.resolve('babel-loader'),
              options: {
                cacheDirectory: true,
                extends: getBabelPath(),
              },
            },
            exclude: [/node_modules/, path.join(cwd, 'renderer')],
          },
        ],
      },
      resolve: {
        extensions: ['.ts', '.js', '.json'],
        modules: ['node_modules'],
        plugins: [isTs ? new TsconfigPathsPlugins() : null].filter(Boolean),
      },
      stats: 'errors-only',
      node: {
        __dirname: false,
        __filename: false,
      },
    }

    return config
  }
