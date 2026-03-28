import webpack from 'webpack'
import { merge } from 'webpack-merge'
import TerserPlugin from 'terser-webpack-plugin'
import { getBaseConfigMain } from '../get-base-config-main'
import { getBaseConfigPreload } from '../get-base-config-preload'
import { getNextronConfig } from '../../helpers/get-nextron-config'

const buildMainScript = async (): Promise<void> => {
  let config: webpack.Configuration = merge(await getBaseConfigMain(), {
    mode: 'production',
    devtool: 'source-map',
    optimization: {
      minimizer: [
        new TerserPlugin({
          parallel: true,
        }),
      ],
    },
    plugins: [
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'production',
      }),
    ],
  })

  const { webpack: userWebpack } = await getNextronConfig()
  if (typeof userWebpack === 'function') {
    config = userWebpack(config, 'production')
  }

  webpack(config).run((error, stats) => {
    if (error) {
      console.error(error.stack || error)
    }

    if (stats) {
      console.log(stats.toString())
    }
  })
}

const buildPreloadScript = async (): Promise<void> => {
  const config: webpack.Configuration = merge(await getBaseConfigPreload(), {
    mode: 'production',
    devtool: 'source-map',
    optimization: {
      minimizer: [
        new TerserPlugin({
          parallel: true,
        }),
      ],
    },
    plugins: [
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'production',
      }),
    ],
  })

  webpack(config).run((error, stats) => {
    if (error) {
      console.error(error.stack || error)
    }

    if (stats) {
      console.log(stats.toString())
    }
  })
}

;(async () => {
  await Promise.all([buildMainScript(), buildPreloadScript()])
})()
