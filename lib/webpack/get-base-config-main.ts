import path from 'path'
import webpack from 'webpack'
import TsconfigPathsPlugins from 'tsconfig-paths-webpack-plugin'
import { isTs, ext, isEsm, externals } from '../helpers/get-project-settings'
import { getNextronConfig } from '../helpers/get-nextron-config'
import { getBabelPath } from '../helpers/get-babel-path'

const cwd = process.cwd()

export const getBaseConfigMain = async (): Promise<webpack.Configuration> => {
  const { mainSrcDir } = await getNextronConfig()

  const mainPath = path.join(cwd, mainSrcDir || 'main', `main${ext}`)

  const config: webpack.Configuration = {
    target: 'electron-main',
    entry: {
      main: mainPath,
    },
    output: {
      filename: '[name].js',
      path: path.join(cwd, 'app'),
      module: isEsm,
      library: {
        type: isEsm ? 'module' : 'umd',
      },
    },
    experiments: {
      outputModule: isEsm,
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
